package com.example.karting3.Entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rates_laps")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RatesLapsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int laps;
    private double rate;

}
