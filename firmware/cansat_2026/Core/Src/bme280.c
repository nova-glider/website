/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : bme280.c
  * @brief          : BME280 sensor driver
  * @author         : Sam Vandenabeele
  ******************************************************************************
  * @attention
  *
  * This file is part of the NovaCan project.
  *
  * Copyright (C) 2025 NovaCan, Sam Vandenabeele
  *
  * This program is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * This program is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  ******************************************************************************
**/
/* USER CODE END Header */
#include "bme280.h"

static uint8_t BME280_Read8(BME280_HandleTypedef *dev, uint8_t reg) {
    uint8_t tx = reg | 0x80;
    uint8_t rx = 0;
    BME280_SPI_CS_LOW(dev->cs_port, dev->cs_pin);
    HAL_SPI_Transmit(dev->hspi, &tx, 1, HAL_MAX_DELAY);
    HAL_SPI_Receive(dev->hspi, &rx, 1, HAL_MAX_DELAY);
    BME280_SPI_CS_HIGH(dev->cs_port, dev->cs_pin);
    return rx;
}

static void BME280_Write8(BME280_HandleTypedef *dev, uint8_t reg, uint8_t data) {
    uint8_t tx[2] = { reg & 0x7F, data };
    BME280_SPI_CS_LOW(dev->cs_port, dev->cs_pin);
    HAL_SPI_Transmit(dev->hspi, tx, 2, HAL_MAX_DELAY);
    BME280_SPI_CS_HIGH(dev->cs_port, dev->cs_pin);
}

static void BME280_ReadBuf(BME280_HandleTypedef *dev, uint8_t reg, uint8_t *buf, uint8_t len) {
    reg |= 0x80;
    BME280_SPI_CS_LOW(dev->cs_port, dev->cs_pin);
    HAL_SPI_Transmit(dev->hspi, &reg, 1, HAL_MAX_DELAY);
    HAL_SPI_Receive(dev->hspi, buf, len, HAL_MAX_DELAY);
    BME280_SPI_CS_HIGH(dev->cs_port, dev->cs_pin);
}

static void BME280_ReadCalibration(BME280_HandleTypedef *dev) {
    uint8_t buf[26];
    BME280_ReadBuf(dev, 0x88, buf, 26);

    dev->dig_T1 = (buf[1] << 8) | buf[0];
    dev->dig_T2 = (buf[3] << 8) | buf[2];
    dev->dig_T3 = (buf[5] << 8) | buf[4];

    dev->dig_P1 = (buf[7] << 8) | buf[6];
    dev->dig_P2 = (buf[9] << 8) | buf[8];
    dev->dig_P3 = (buf[11] << 8) | buf[10];
    dev->dig_P4 = (buf[13] << 8) | buf[12];
    dev->dig_P5 = (buf[15] << 8) | buf[14];
    dev->dig_P6 = (buf[17] << 8) | buf[16];
    dev->dig_P7 = (buf[19] << 8) | buf[18];
    dev->dig_P8 = (buf[21] << 8) | buf[20];
    dev->dig_P9 = (buf[23] << 8) | buf[22];

    dev->dig_H1 = BME280_Read8(dev, 0xA1);

    uint8_t hbuf[7];
    BME280_ReadBuf(dev, 0xE1, hbuf, 7);
    dev->dig_H2 = (hbuf[1] << 8) | hbuf[0];
    dev->dig_H3 = hbuf[2];
    dev->dig_H4 = (hbuf[3] << 4) | (hbuf[4] & 0x0F);
    dev->dig_H5 = (hbuf[5] << 4) | (hbuf[4] >> 4);
    dev->dig_H6 = hbuf[6];
}

uint8_t BME280_Init(BME280_HandleTypedef *dev) {
    if (BME280_Read8(dev, BME280_REG_ID) != 0x60)
        return 0;

    BME280_Write8(dev, BME280_REG_RESET, BME280_RESET_VALUE);
    HAL_Delay(100);

    BME280_ReadCalibration(dev);

    BME280_Write8(dev, BME280_REG_CTRL_HUM, 0x01);  // Humidity oversampling x1
    BME280_Write8(dev, BME280_REG_CTRL_MEAS, 0x27); // Temp x1, Press x1, Mode normal
    BME280_Write8(dev, BME280_REG_CONFIG, 0xA0);    // Standby 1000ms, filter off

    return 1;
}

static int32_t BME280_Compensate_Temp(BME280_HandleTypedef *dev, int32_t adc_T) {
    int32_t var1 = ((((adc_T >> 3) - ((int32_t)dev->dig_T1 << 1))) * ((int32_t)dev->dig_T2)) >> 11;
    int32_t var2 = (((((adc_T >> 4) - ((int32_t)dev->dig_T1)) * ((adc_T >> 4) - ((int32_t)dev->dig_T1))) >> 12) *
                   ((int32_t)dev->dig_T3)) >> 14;

    dev->t_fine = var1 + var2;
    return (dev->t_fine * 5 + 128) >> 8;
}

static uint32_t BME280_Compensate_Press(BME280_HandleTypedef *dev, int32_t adc_P) {
    int64_t var1, var2, p;
    var1 = ((int64_t)dev->t_fine) - 128000;
    var2 = var1 * var1 * (int64_t)dev->dig_P6;
    var2 = var2 + ((var1 * (int64_t)dev->dig_P5) << 17);
    var2 = var2 + (((int64_t)dev->dig_P4) << 35);
    var1 = ((var1 * var1 * (int64_t)dev->dig_P3) >> 8) +
           ((var1 * (int64_t)dev->dig_P2) << 12);
    var1 = (((((int64_t)1) << 47) + var1)) * ((int64_t)dev->dig_P1) >> 33;
    if (var1 == 0) return 0;
    p = 1048576 - adc_P;
    p = (((p << 31) - var2) * 3125) / var1;
    var1 = (((int64_t)dev->dig_P9) * (p >> 13) * (p >> 13)) >> 25;
    var2 = (((int64_t)dev->dig_P8) * p) >> 19;
    p = ((p + var1 + var2) >> 8) + (((int64_t)dev->dig_P7) << 4);
    return (uint32_t)p / 256;
}

static uint32_t BME280_Compensate_Humidity(BME280_HandleTypedef *dev, int32_t adc_H) {
    int32_t v_x1 = dev->t_fine - 76800;
    v_x1 = (((((adc_H << 14) - (((int32_t)dev->dig_H4) << 20) - (((int32_t)dev->dig_H5) * v_x1)) +
              16384) >> 15) *
            (((((((v_x1 * ((int32_t)dev->dig_H6)) >> 10) *
                 (((v_x1 * ((int32_t)dev->dig_H3)) >> 11) + 32768)) >> 10) + 2097152) *
              ((int32_t)dev->dig_H2) + 8192) >> 14));
    v_x1 = v_x1 - (((((v_x1 >> 15) * (v_x1 >> 15)) >> 7) * ((int32_t)dev->dig_H1)) >> 4);
    v_x1 = (v_x1 < 0) ? 0 : v_x1;
    v_x1 = (v_x1 > 419430400) ? 419430400 : v_x1;
    return (uint32_t)(v_x1 >> 12);
}

uint8_t BME280_ReadData(BME280_HandleTypedef *dev, BME280_Data *data) {
    uint8_t buf[8];
    BME280_ReadBuf(dev, BME280_REG_PRESS_MSB, buf, 8);

    int32_t adc_P = ((int32_t)buf[0] << 12) | ((int32_t)buf[1] << 4) | ((buf[2] >> 4) & 0x0F);
    int32_t adc_T = ((int32_t)buf[3] << 12) | ((int32_t)buf[4] << 4) | ((buf[5] >> 4) & 0x0F);
    int32_t adc_H = ((int32_t)buf[6] << 8) | buf[7];

    data->temperature = BME280_Compensate_Temp(dev, adc_T) / 100.0f;
    data->pressure = BME280_Compensate_Press(dev, adc_P) / 100.0f;
    data->humidity = BME280_Compensate_Humidity(dev, adc_H) / 1024.0f;

    return 1;
}
