package com.evcharge.dto;

import com.evcharge.model.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Dtos {
    public record RegisterRequest(@NotBlank String name,
                                  @NotBlank @Email String email,
                                  @NotBlank @Size(min = 6, message = "Password must be at least 6 characters") String password) {}

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {}

    public record AuthResponse(String token, String name, String email, String role) {}

    public record BookingRequest(@NotNull Long chargerId,
                                 @NotNull LocalDateTime startTime,
                                 @Min(1) @Max(8) int hours) {}

    public record SlotDto(LocalDateTime start, LocalDateTime end, boolean available) {}

    public record BookingDto(Long id, Long chargerId, String stationName, String chargerName,
                             LocalDateTime startTime, LocalDateTime endTime,
                             BigDecimal totalCost, String status, String userEmail) {}

    public record StationRequest(@NotBlank String name, @NotBlank String address, @NotBlank String city) {}

    public record ChargerRequest(@NotNull Long stationId,
                                 @NotBlank String name,
                                 @NotNull ChargerType type,
                                 @NotNull @DecimalMin("0.1") BigDecimal powerKw,
                                 @NotNull @DecimalMin("0.0") BigDecimal ratePerHour,
                                 ChargerStatus status) {}
}
