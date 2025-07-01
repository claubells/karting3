package com.example.karting3.Repositories;

import com.example.karting3.Entities.ReservationHourEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationHourRepository extends JpaRepository<ReservationHourEntity, Long> {
}
