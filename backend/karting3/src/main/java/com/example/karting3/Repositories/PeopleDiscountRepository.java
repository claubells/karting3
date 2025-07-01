package com.example.karting3.Repositories;

import com.example.karting3.Entities.PeopleDiscountEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PeopleDiscountRepository extends JpaRepository<PeopleDiscountEntity, Long> {

    @Query("SELECT p.discount " +
            "FROM PeopleDiscountEntity p " +
            "WHERE  :numberPeople >= p.minPeople AND :numberPeople <= p.maxPeople ")
    Double getPeopleDiscountEntityByPeople(@Param("numberPeople") int numberPeople);
}
