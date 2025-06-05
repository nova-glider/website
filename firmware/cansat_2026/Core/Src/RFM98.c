/* USER CODE BEGIN header*/
/**
 *****************************************************************************
 * @file           : RFM98.c
 * @brief          : radio module driver for RFM98W
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
**/
/* USER CODE END header */
#include "RFM98.h"
#include "main.h"
#include <string.h>
#include <stdint.h>

// SX1278 Register Definitions
#define REG_FIFO                      0x00
#define REG_OP_MODE                   0x01
#define REG_FRF_MSB                   0x06
#define REG_FRF_MID                   0x07
#define REG_FRF_LSB                   0x08
#define REG_PA_CONFIG                 0x09
#define REG_FIFO_ADDR_PTR             0x0D
#define REG_FIFO_TX_BASE_ADDR         0x0E
#define REG_FIFO_RX_BASE_ADDR         0x0F
#define REG_FIFO_RX_CURRENT_ADDR      0x10
#define REG_IRQ_FLAGS                 0x12
#define REG_RX_NB_BYTES               0x13
#define REG_PKT_RSSI_VALUE            0x1A
#define REG_MODEM_CONFIG_1            0x1D
#define REG_MODEM_CONFIG_2            0x1E
#define REG_SYMB_TIMEOUT_LSB          0x1F
#define REG_PREAMBLE_MSB              0x20
#define REG_PREAMBLE_LSB              0x21
#define REG_PAYLOAD_LENGTH            0x22
#define REG_MODEM_CONFIG_3            0x26
#define REG_DIO_MAPPING_1             0x40
#define REG_VERSION                   0x42

#define MODE_LONG_RANGE_MODE          0x80
#define MODE_SLEEP                    0x00
#define MODE_STDBY                    0x01
#define MODE_TX                       0x03
#define MODE_RX_CONTINUOUS            0x05

#define PA_BOOST                      0x80

extern SPI_HandleTypeDef RFM98_SPI_HANDLE;

static void RFM98_WriteReg(uint8_t addr, uint8_t value) {
    RFM98_NSS_LOW();
    uint8_t buf[2] = { addr | 0x80, value };
    HAL_SPI_Transmit(&RFM98_SPI_HANDLE, buf, 2, HAL_MAX_DELAY);
    RFM98_NSS_HIGH();
}

static uint8_t RFM98_ReadReg(uint8_t addr) {
    uint8_t buf[2] = { addr & 0x7F, 0x00 };
    uint8_t ret[2];
    RFM98_NSS_LOW();
    HAL_SPI_TransmitReceive(&RFM98_SPI_HANDLE, buf, ret, 2, HAL_MAX_DELAY);
    RFM98_NSS_HIGH();
    return ret[1];
}

void RFM98_Reset(void) {
    RFM98_RST_LOW();
    HAL_Delay(10);
    RFM98_RST_HIGH();
    HAL_Delay(10);
}

void RFM98_SetFrequency(uint64_t freq) {
    uint64_t frf = (freq << 19) / 32000000;
    RFM98_WriteReg(REG_FRF_MSB, (uint8_t)(frf >> 16));
    RFM98_WriteReg(REG_FRF_MID, (uint8_t)(frf >> 8));
    RFM98_WriteReg(REG_FRF_LSB, (uint8_t)(frf));
}

void RFM98_SetTxPower(uint8_t level) {
    if (level > 17) level = 17;
    RFM98_WriteReg(REG_PA_CONFIG, PA_BOOST | (level - 2));
}

void RFM98_SetSpreadingFactor(uint8_t sf) {
    if (sf < 6) sf = 6;
    if (sf > 12) sf = 12;
    RFM98_WriteReg(REG_MODEM_CONFIG_2, (RFM98_ReadReg(REG_MODEM_CONFIG_2) & 0x0F) | ((sf << 4) & 0xF0));
}

void RFM98_SetSignalBandwidth(uint32_t sbw) {
    uint8_t bw;
    if (sbw <= 7800) bw = 0;
    else if (sbw <= 10400) bw = 1;
    else if (sbw <= 15600) bw = 2;
    else if (sbw <= 20800) bw = 3;
    else if (sbw <= 31250) bw = 4;
    else if (sbw <= 41700) bw = 5;
    else if (sbw <= 62500) bw = 6;
    else if (sbw <= 125000) bw = 7;
    else if (sbw <= 250000) bw = 8;
    else bw = 9;
    RFM98_WriteReg(REG_MODEM_CONFIG_1, (RFM98_ReadReg(REG_MODEM_CONFIG_1) & 0x0F) | (bw << 4));
}

void RFM98_SetMode(uint8_t mode) {
    RFM98_WriteReg(REG_OP_MODE, MODE_LONG_RANGE_MODE | mode);
}

void RFM98_Init(void) {
    RFM98_Reset();
    while (RFM98_ReadReg(REG_VERSION) != 0x12);

    RFM98_SetMode(MODE_SLEEP);
    RFM98_SetFrequency(433000000);
    RFM98_SetTxPower(17);
    RFM98_SetSpreadingFactor(7);
    RFM98_SetSignalBandwidth(125000);

    RFM98_WriteReg(REG_FIFO_TX_BASE_ADDR, 0);
    RFM98_WriteReg(REG_FIFO_RX_BASE_ADDR, 0);

    RFM98_WriteReg(REG_MODEM_CONFIG_3, 0x04);  // Low data rate optimization

    RFM98_WriteReg(REG_DIO_MAPPING_1, 0x40);  // DIO0 = TxDone / RxDone

    RFM98_SetMode(MODE_STDBY);
}

void RFM98_Transmit(uint8_t *data, uint8_t length) {
    RFM98_SetMode(MODE_STDBY);
    RFM98_WriteReg(REG_FIFO_ADDR_PTR, 0);

    for (uint8_t i = 0; i < length; i++) {
        RFM98_WriteReg(REG_FIFO, data[i]);
    }

    RFM98_WriteReg(REG_PAYLOAD_LENGTH, length);
    RFM98_SetMode(MODE_TX);

    uint32_t start = HAL_GetTick();
    while (RFM98_DIO0_Read() == 0) {
        if (HAL_GetTick() - start > 5000) return;  // Timeout
    }
    RFM98_WriteReg(REG_IRQ_FLAGS, 0x08);
}

uint8_t RFM98_Receive(uint8_t *buffer, uint8_t maxLength) {
    RFM98_SetMode(MODE_RX_CONTINUOUS);

    if (RFM98_DIO0_Read()) {
        uint8_t len = RFM98_ReadReg(REG_RX_NB_BYTES);
        RFM98_WriteReg(REG_IRQ_FLAGS, 0x40);
        RFM98_WriteReg(REG_FIFO_ADDR_PTR, RFM98_ReadReg(REG_FIFO_RX_CURRENT_ADDR));
        for (uint8_t i = 0; i < len && i < maxLength; i++) {
            buffer[i] = RFM98_ReadReg(REG_FIFO);
        }
        return len;
    }
    return 0;
}
