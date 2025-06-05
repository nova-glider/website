#ifndef __LORA_RFM98_H
#define __LORA_RFM98_H

#include "stm32g0xx_hal.h"  // Use the correct case for the header file
#include "stm32g0xx_hal_gpio.h"

#define RFM98_SPI_HANDLE hspi1  // Change as needed
extern SPI_HandleTypeDef RFM98_SPI_HANDLE;

// Pin control macros (define your GPIO ports and pins)
#define RFM98_NSS_HIGH() HAL_GPIO_WritePin(SPI1_CS_GPIO_Port, SPI1_CS_Pin, GPIO_PIN_SET)
#define RFM98_NSS_LOW()  HAL_GPIO_WritePin(SPI1_CS_GPIO_Port, SPI1_CS_Pin, GPIO_PIN_RESET)

#define RFM98_RST_HIGH() HAL_GPIO_WritePin(SPI1_RST_GPIO_Port, SPI1_RST_Pin, GPIO_PIN_SET)
#define RFM98_RST_LOW()  HAL_GPIO_WritePin(SPI1_RST_GPIO_Port, SPI1_RST_Pin, GPIO_PIN_RESET)

#define RFM98_DIO0_Read() HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_0)

void RFM98_Init(void);
void RFM98_SetFrequency(uint64_t freq);
void RFM98_SetTxPower(uint8_t level);
void RFM98_Transmit(uint8_t *data, uint8_t length);
uint8_t RFM98_Receive(uint8_t *buffer, uint8_t maxLength);

#endif
