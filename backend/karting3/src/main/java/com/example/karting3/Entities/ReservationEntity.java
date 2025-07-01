package com.example.karting3.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name="reservation")
@Getter //lombok
@Setter //lombok
@NoArgsConstructor
@AllArgsConstructor
public class ReservationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    //@JsonProperty("idReservation")
    private Long idReservation;
    private String statusReservation; // se define en el back inicialmente como pendiente
    private LocalDate dateReservation;
    private LocalTime startHourReservation;
    private LocalTime finalHourReservation;
    private int turnsTimeReservation;
    private int groupSizeReservation;
    private String holdersReservation; // rut

    @ElementCollection
    @CollectionTable(name = "reservation_clients", joinColumns = @JoinColumn(name = "reservation_id"))
    @Column(name = "client_id")
    private List<Long> clientIds;

    @ElementCollection
    @CollectionTable(name = "reservation_karts", joinColumns = @JoinColumn(name = "reservation_id"))
    @Column(name = "kart_id")
    private List<Long> kartIds;

}
