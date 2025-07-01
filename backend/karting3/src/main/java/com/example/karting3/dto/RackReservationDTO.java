package com.example.karting3.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RackReservationDTO {
    private Long idReservation;
    private String holdersReservation;
    private LocalDate dateReservation;
    private String startHourReservation;
    private String finalHourReservation;
    private int turnsTimeReservation;
    private int groupSizeReservation;
    private String statusReservation;
}