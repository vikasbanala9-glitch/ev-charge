package com.evcharge.controller;

import com.evcharge.dto.Dtos.*;
import com.evcharge.model.*;
import com.evcharge.repository.*;
import com.evcharge.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.NoSuchElementException;

/** Everything under /api/admin requires the ADMIN role (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final StationRepository stations;
    private final ChargerRepository chargers;
    private final BookingRepository bookingRepo;
    private final BookingService bookingService;

    // ---- stations ----
    @PostMapping("/stations")
    public Station createStation(@Valid @RequestBody StationRequest r) {
        Station s = new Station();
        apply(s, r);
        return stations.save(s);
    }

    @PutMapping("/stations/{id}")
    public Station updateStation(@PathVariable Long id, @Valid @RequestBody StationRequest r) {
        Station s = stations.findById(id).orElseThrow(() -> new NoSuchElementException("Station not found"));
        apply(s, r);
        return stations.save(s);
    }

    @DeleteMapping("/stations/{id}")
    public void deleteStation(@PathVariable Long id) {
        if (!chargers.findByStationId(id).isEmpty())
            throw new IllegalStateException("Remove this station's chargers first.");
        stations.deleteById(id);
    }

    // ---- chargers (rate is set here) ----
    @PostMapping("/chargers")
    public Charger createCharger(@Valid @RequestBody ChargerRequest r) {
        Charger c = new Charger();
        apply(c, r);
        return chargers.save(c);
    }

    @PutMapping("/chargers/{id}")
    public Charger updateCharger(@PathVariable Long id, @Valid @RequestBody ChargerRequest r) {
        Charger c = chargers.findById(id).orElseThrow(() -> new NoSuchElementException("Charger not found"));
        apply(c, r);
        return chargers.save(c);
    }

    @DeleteMapping("/chargers/{id}")
    public void deleteCharger(@PathVariable Long id) {
        if (bookingRepo.existsByChargerId(id))
            throw new IllegalStateException("This charger has bookings. Set it to MAINTENANCE instead of deleting.");
        chargers.deleteById(id);
    }

    // ---- bookings ----
    @GetMapping("/bookings")
    public List<BookingDto> allBookings() { return bookingService.all(); }

    private void apply(Station s, StationRequest r) {
        s.setName(r.name().trim());
        s.setAddress(r.address().trim());
        s.setCity(r.city().trim());
    }

    private void apply(Charger c, ChargerRequest r) {
        c.setStation(stations.findById(r.stationId())
                .orElseThrow(() -> new NoSuchElementException("Station not found")));
        c.setName(r.name().trim());
        c.setType(r.type());
        c.setPowerKw(r.powerKw());
        c.setRatePerHour(r.ratePerHour());
        c.setStatus(r.status() == null ? ChargerStatus.ACTIVE : r.status());
    }
}
