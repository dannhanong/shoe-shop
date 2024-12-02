package com.dan.shoe.shoe.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "brands")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, columnDefinition = "nvarchar(255)")
    private String name;
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;
    private String logoUrl;
}

