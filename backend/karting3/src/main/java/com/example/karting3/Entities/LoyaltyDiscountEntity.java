package com.example.karting3.Entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loyalty_discount")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyDiscountEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int visit;
    private double discount;
}
