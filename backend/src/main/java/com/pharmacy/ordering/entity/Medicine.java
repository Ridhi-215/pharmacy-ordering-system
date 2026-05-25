package com.pharmacy.ordering.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "medicine_id")
    private Integer medicineId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "dosage", length = 50)
    private String dosage;

    @Column(name = "packaging", length = 50)
    private String packaging;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "requires_prescription", nullable = false)
    private Boolean requiresPrescription;

    @Column(name = "manufacturer", length = 100)
    private String manufacturer;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", length = 30)
    @Builder.Default
    private ProductType productType = ProductType.MEDICINE;
}
