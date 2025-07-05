package com.example.karting3.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "people_discount")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PeopleDiscountEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int minPeople;
    private int maxPeople;
    private double discount;
}
