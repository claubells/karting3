package com.example.karting3.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationMiniDTO {
    private Long idReservation;
    private LocalDate dateReservation;        // formato "2025-04-10"
    private int turnsTimeReservation;      // 10, 15, 20
    private int groupSizeReservation;      // 1..n
}