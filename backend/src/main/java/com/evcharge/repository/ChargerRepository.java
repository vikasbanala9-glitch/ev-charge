package com.evcharge.repository;

import com.evcharge.model.Charger;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ChargerRepository extends JpaRepository<Charger, Long> {
    List<Charger> findByStationId(Long stationId);

    /** Row lock so two people cannot book the same slot at the same moment. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Charger c where c.id = :id")
    Optional<Charger> findByIdForUpdate(@Param("id") Long id);
}
