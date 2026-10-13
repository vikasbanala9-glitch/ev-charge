package com.evcharge.repository;

import com.evcharge.model.Booking;
import com.evcharge.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Overlap rule: existing.start < newEnd AND existing.end > newStart
    boolean existsByChargerIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            Long chargerId, BookingStatus status, LocalDateTime newEnd, LocalDateTime newStart);

    List<Booking> findByChargerIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            Long chargerId, BookingStatus status, LocalDateTime windowEnd, LocalDateTime windowStart);

    List<Booking> findByUserEmailOrderByStartTimeDesc(String email);

    List<Booking> findAllByOrderByStartTimeDesc();

    boolean existsByChargerId(Long chargerId);
}
