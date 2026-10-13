package com.evcharge.service;

import com.evcharge.dto.Dtos.*;
import com.evcharge.model.*;
import com.evcharge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookings;
    private final ChargerRepository chargers;
    private final UserRepository users;

    @Transactional
    public BookingDto book(String email, BookingRequest req) {
        LocalDateTime start = req.startTime();
        if (start.getMinute() != 0 || start.getSecond() != 0)
            throw new IllegalArgumentException("Slots start on the hour (for example 10:00).");
        if (start.isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("You cannot book a slot that has already started.");

        // Lock the charger row so concurrent bookings are checked one at a time.
        Charger charger = chargers.findByIdForUpdate(req.chargerId())
                .orElseThrow(() -> new NoSuchElementException("Charger not found"));
        if (charger.getStatus() != ChargerStatus.ACTIVE)
            throw new IllegalStateException("This charger is under maintenance.");

        LocalDateTime end = start.plusHours(req.hours());
        if (bookings.existsByChargerIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                charger.getId(), BookingStatus.CONFIRMED, end, start))
            throw new IllegalStateException("That time is already booked. Pick another slot.");

        User user = users.findByEmail(email).orElseThrow(() -> new NoSuchElementException("User not found"));

        Booking b = new Booking();
        b.setUser(user);
        b.setCharger(charger);
        b.setStartTime(start);
        b.setEndTime(end);
        b.setTotalCost(charger.getRatePerHour().multiply(BigDecimal.valueOf(req.hours())));
        return toDto(bookings.save(b));
    }

    @Transactional(readOnly = true)
    public List<SlotDto> slots(Long chargerId, LocalDate date) {
        if (!chargers.existsById(chargerId)) throw new NoSuchElementException("Charger not found");
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = dayStart.plusDays(1);
        List<Booking> existing = bookings.findByChargerIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                chargerId, BookingStatus.CONFIRMED, dayEnd, dayStart);
        LocalDateTime now = LocalDateTime.now();

        List<SlotDto> out = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            LocalDateTime s = dayStart.plusHours(h);
            LocalDateTime e = s.plusHours(1);
            boolean taken = existing.stream()
                    .anyMatch(b -> b.getStartTime().isBefore(e) && b.getEndTime().isAfter(s));
            out.add(new SlotDto(s, e, !taken && !s.isBefore(now)));
        }
        return out;
    }

    @Transactional
    public BookingDto cancel(Long id, String email, boolean isAdmin) {
        Booking b = bookings.findById(id).orElseThrow(() -> new NoSuchElementException("Booking not found"));
        if (!isAdmin && !b.getUser().getEmail().equals(email))
            throw new IllegalArgumentException("You can only cancel your own bookings.");
        if (b.getStatus() == BookingStatus.CANCELLED)
            throw new IllegalStateException("Booking is already cancelled.");
        if (!b.getStartTime().isAfter(LocalDateTime.now()))
            throw new IllegalStateException("Bookings that have started cannot be cancelled.");
        b.setStatus(BookingStatus.CANCELLED);
        return toDto(bookings.save(b));
    }

    @Transactional(readOnly = true)
    public List<BookingDto> mine(String email) {
        return bookings.findByUserEmailOrderByStartTimeDesc(email).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingDto> all() {
        return bookings.findAllByOrderByStartTimeDesc().stream().map(this::toDto).toList();
    }

    private BookingDto toDto(Booking b) {
        return new BookingDto(b.getId(), b.getCharger().getId(),
                b.getCharger().getStation().getName(), b.getCharger().getName(),
                b.getStartTime(), b.getEndTime(), b.getTotalCost(),
                b.getStatus().name(), b.getUser().getEmail());
    }
}
