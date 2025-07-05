package com.example.karting3.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="receipt")
@Getter //lombok
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long idReceipt;

    private String rutClientReceipt;

    private String nameClientReceipt;

    // precio en cuanto a vueltas/tiempo y si es fin de semana/feriado
    private double baseRateReceipt;

    private double groupSizeDiscount;

    private double birthdayDiscount; // cumpleaños

    private double loyaltyDiscount;  // cliente frecuente

    private double specialDaysDiscount; // feriados, fines de semana

    private double maxDiscount; // descuento máximo

    private double finalAmount; // base rate -descuentos

    private double ivaAmount;

    private double totalAmount; // finalamount +iva

    @Column(name = "client_id")
    private Long clientId;

    @Column(name = "reservation_id")
    private Long reservationId;
}
