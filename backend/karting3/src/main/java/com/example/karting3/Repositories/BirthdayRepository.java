package com.example.karting3.Repositories;

import com.example.karting3.Entities.BirthdayEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BirthdayRepository extends JpaRepository<BirthdayEntity, Long> {

    @Query("SELECT b.discount " +
            "FROM BirthdayEntity b " +
            "WHERE b.id_birthday = :id ")
    Double getDiscountById(@Param("id") int i);
}
