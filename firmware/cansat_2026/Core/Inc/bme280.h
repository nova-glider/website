/* USER CODE BEGIN header */
/**
  ******************************************************************************
  * @file           : bme280.h
  * @brief          : bmeé280.c include file
  * @author         : Sam Vandenabeele
  ******************************************************************************
  * @attention
  *
  * This file is part of the NovaCan project.
  *
  * Copyright (C) 2025 NovaCan, Wannes Ghysels
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
/* USER CODE END header */
#ifndef BME280_H
#define BME280_H

#include "stm32g0xx_hal.h"
#include <stdint.h>

#define BME280_SPI_CS_HIGH(cs_port, cs_pin) HAL_GPIO_WritePin(cs_port, cs_pin, GPIO_PIN_SET)
#define BME280_SPI_CS_LOW(cs_port, cs_pin)  HAL_GPIO_WritePin(cs_port, cs_pin, GPIO_PIN_RESET)

// Register addresses
#define BME280_REG_ID              0xD0
#define BME280_REG_RESET           0xE0
#define BME280_REG_CTRL_HUM        0xF2
#define BME280_REG_STATUS          0xF3
#define BME280_REG_CTRL_MEAS       0xF4
#define BME280_REG_CONFIG          0xF5
#define BME280_REG_PRESS_MSB       0xF7

// Reset value
#define BME280_RESET_VALUE         0xB6

typedef struct {
    SPI_HandleTypeDef *hspi;
    GPIO_TypeDef *cs_port;
    uint16_t cs_pin;

    // Compensation params
    uint16_t dig_T1;
    int16_t  dig_T2, dig_T3;
    uint16_t dig_P1;
    int16_t  dig_P2, dig_P3, dig_P4, dig_P5, dig_P6, dig_P7, dig_P8, dig_P9;
    uint8_t  dig_H1;
    int16_t  dig_H2;
    uint8_t  dig_H3;
    int16_t  dig_H4, dig_H5;
    int8_t   dig_H6;

    int32_t t_fine;
} BME280_HandleTypedef;

typedef struct {
    float temperature;
    float pressure;
    float humidity;
} BME280_Data;

uint8_t BME280_Init(BME280_HandleTypedef *dev);
uint8_t BME280_ReadData(BME280_HandleTypedef *dev, BME280_Data *data);

#endif
