package com.example.karting3.repositories;

import com.example.karting3.entities.ReceiptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ReceiptRepository extends JpaRepository<ReceiptEntity, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM ReceiptEntity r " +
            "WHERE r.reservationId = :reservationId")
    void deleteByReservationId(@Param("reservationId") Long reservationId);

    @Query("SELECT r " +
            "FROM ReceiptEntity r " +
            "WHERE r.reservationId = :idReservation")
    List<ReceiptEntity> findAllByReservationId(String idReservation);

    @Query("""
    SELECT COUNT(r)
    FROM ReceiptEntity r
    JOIN ReservationEntity re ON r.reservationId = re.idReservation
    WHERE r.rutClientReceipt = :rut
      AND EXTRACT(YEAR FROM re.dateReservation) = :year
      AND EXTRACT(MONTH FROM re.dateReservation) = :month""")
    int countReceiptsByRutAndMonth(@Param("rut") String rut, @Param("year") int year, @Param("month") int month);

    @Query("""
    SELECT COALESCE(SUM(r.totalAmount), 0)
    FROM ReceiptEntity r
    JOIN ReservationEntity re ON r.reservationId = re.idReservation
    WHERE re.groupSizeReservation BETWEEN :min AND :max
    AND FUNCTION('TO_CHAR', re.dateReservation, 'MM') = :mes
    """)
    int obtenerIngresoPorRangoYMes(@Param("min") int min, @Param("max") int max, @Param("mes") String mes);

    @Query("""
    SELECT COALESCE(SUM(r.totalAmount), 0)
    FROM ReceiptEntity r
    JOIN ReservationEntity re ON r.reservationId = re.idReservation
    WHERE re.turnsTimeReservation = :turns
    AND FUNCTION('TO_CHAR', re.dateReservation, 'MM') = :mes
    """)
    int obtenerIngresoPorVueltasYMes(@Param("turns") int turns, @Param("mes") String mes);


    @Query("""
    SELECT COALESCE(SUM(r.totalAmount), 0)
    FROM ReceiptEntity r
    JOIN ReservationEntity re ON r.reservationId = re.idReservation
    WHERE re.turnsTimeReservation = :turns
    AND FUNCTION('TO_CHAR', re.dateReservation, 'MM') = :mes
    AND FUNCTION('TO_CHAR', re.dateReservation, 'YYYY') = :anio
""")
    int obtenerIngresoPorVueltasMesYAnio(@Param("turns") int turns, @Param("mes") String mes, @Param("anio") String anio);
}
