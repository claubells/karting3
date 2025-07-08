package com.example.karting3.repositories;

import com.example.karting3.entities.ReservationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationEntity, Long> {
    @Query("SELECT r FROM ReservationEntity r WHERE r.dateReservation = :fecha AND " +
            "(r.startHourReservation < :horaFin AND r.finalHourReservation > :horaInicio)")
    List<ReservationEntity> findOverlappingReservations(
            @Param("fecha") LocalDate fecha,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFin") LocalTime horaFin
    );

    @Query("""
        SELECT COUNT(r) 
        FROM ReservationEntity r 
        WHERE r.holdersReservation = :rut
          AND r.statusReservation = 'pagada'
          AND EXTRACT(YEAR FROM r.dateReservation) = :year
          AND EXTRACT(MONTH FROM r.dateReservation) = :month
    """)
    int countPaidReservationsByRutAndMonth(@Param("rut") String rut, @Param("year") int year, @Param("month") int month);

    @Query("""
        SELECT r
        FROM ReservationEntity r
        WHERE r.statusReservation = :statusReservation
    """)
    List<ReservationEntity> findByStatusReservation(@Param("statusReservation") String statusReservation);

    List<ReservationEntity> findByDateReservation(LocalDate dateReservation);
}
