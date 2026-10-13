package com.evcharge.controller;

import com.evcharge.dto.Dtos.*;
import com.evcharge.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService service;

    @PostMapping
    public BookingDto book(Authentication auth, @Valid @RequestBody BookingRequest req) {
        return service.book(auth.getName(), req);
    }

    @GetMapping("/my")
    public List<BookingDto> mine(Authentication auth) { return service.mine(auth.getName()); }

    @PutMapping("/{id}/cancel")
    public BookingDto cancel(Authentication auth, @PathVariable Long id) {
        boolean admin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return service.cancel(id, auth.getName(), admin);
    }
}
