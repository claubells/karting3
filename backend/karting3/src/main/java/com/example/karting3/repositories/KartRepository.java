package com.example.karting3.repositories;


import com.example.karting3.entities.KartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KartRepository extends JpaRepository<KartEntity, Long> {

    @Query("SELECT k FROM KartEntity k WHERE k.statusKart = 'available'")
    List<KartEntity> findAvailableKarts();

}
