package com.example.karting3.repositories;

import com.example.karting3.entities.RatesLapsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RatesLapsRepository extends JpaRepository<RatesLapsEntity, Long> {

    @Query("SELECT r.rate " +
            "FROM RatesLapsEntity r " +
            "WHERE :laps = r.laps ")
    Double getRatesLapsEntityByLaps(@Param("laps") int laps);
}