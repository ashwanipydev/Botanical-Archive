package com.zoo.booking.pricing.entity;

import lombok.Data;

@Data
public class SlotPricing {

    private Long id;

    private Long slotId;

    private String ticketType; // ADULT, CHILD

    private Double price;

    private Boolean isActive = true;
}

