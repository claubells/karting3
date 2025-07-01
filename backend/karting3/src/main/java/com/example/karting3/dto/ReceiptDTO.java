package com.example.karting3.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptDTO {
    private Long reservationId;
    private double baseRateReceipt;
}