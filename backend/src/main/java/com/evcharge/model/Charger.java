package com.evcharge.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "chargers")
@Getter @Setter @NoArgsConstructor
public class Charger {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "station_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Station station;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChargerType type;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal powerKw;

    /** Price per hour of charging, in rupees. */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal ratePerHour;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChargerStatus status = ChargerStatus.ACTIVE;
}
