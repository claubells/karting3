package com.example.karting3.repositories;

import com.example.karting3.entities.HolidayEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface HolidayRepository extends JpaRepository<HolidayEntity, Long> {

    @Query("SELECT h.discount " +
            "FROM HolidayEntity h " +
            "WHERE :fecha = h.date ")
    Double getDiscountByDate(@Param("fecha") LocalDate fecha);

    @Query("SELECT h.discount " +
            "FROM HolidayEntity h " +
            "WHERE h.description = :descripcion ")
    Double getDiscountByDescription(@Param("descripcion") String descripcion);
}
