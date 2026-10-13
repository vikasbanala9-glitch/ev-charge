package com.evcharge.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stations")
@Getter @Setter @NoArgsConstructor
public class Station {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String address;
    @Column(nullable = false)
    private String city;
}
