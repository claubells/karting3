package com.example.karting3.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "reservation_hour")
public class ReservationHourEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalTime weeklyHourMin;
    private LocalTime weeklyHourMax;

    private LocalTime specialHourMin;
    private LocalTime specialHourMax;
}
