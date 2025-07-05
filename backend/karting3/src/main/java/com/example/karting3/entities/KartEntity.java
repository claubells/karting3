package com.example.karting3.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="kart")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KartEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true)
    private Long idKart;

    private String codeKart;

    private String modelKart;

    private String statusKart;

}
