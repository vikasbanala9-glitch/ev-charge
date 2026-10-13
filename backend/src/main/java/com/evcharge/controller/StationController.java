package com.evcharge.controller;

import com.evcharge.dto.Dtos.SlotDto;
import com.evcharge.model.*;
import com.evcharge.repository.*;
import com.evcharge.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

/** Public, read-only endpoints. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StationController {
    private final StationRepository stations;
    private final ChargerRepository chargers;
    private final BookingService bookingService;

    @GetMapping("/stations")
    public List<Station> stations() { return stations.findAll(); }

    @GetMapping("/stations/{id}")
    public Station station(@PathVariable Long id) {
        return stations.findById(id).orElseThrow(() -> new NoSuchElementException("Station not found"));
    }

    @GetMapping("/stations/{id}/chargers")
    public List<Charger> stationChargers(@PathVariable Long id) { return chargers.findByStationId(id); }

    @GetMapping("/chargers")
    public List<Charger> allChargers() { return chargers.findAll(); }

    @GetMapping("/chargers/{id}/slots")
    public List<SlotDto> slots(@PathVariable Long id,
                               @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return bookingService.slots(id, date);
    }
}
