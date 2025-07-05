package com.example.karting3.repositories;

import com.example.karting3.entities.LoyaltyDiscountEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LoyaltyDiscountRepository extends JpaRepository<LoyaltyDiscountEntity, Long> {

    @Query("SELECT l.discount FROM LoyaltyDiscountEntity l WHERE l.visit = :visit")
    Optional<Double> getDiscountByVisit(@Param("visit") int visit);
}
