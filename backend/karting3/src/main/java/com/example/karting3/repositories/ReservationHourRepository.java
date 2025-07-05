package com.example.karting3.repositories;

import com.example.karting3.entities.ReservationHourEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationHourRepository extends JpaRepository<ReservationHourEntity, Long> {
}
