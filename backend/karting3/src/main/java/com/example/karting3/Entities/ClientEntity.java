package com.example.karting3.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "client")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClientEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long idClient;

    @Column(name = "rut", unique = true, nullable = false)
    private String rutClient;

    @Column(name = "name", nullable = false)
    private String nameClient;

    @Column(name = "email")
    private String emailClient;

    @Column(name = "birth_date")
    private LocalDate birthdateClient;
}
