package com.zoo.booking.pricing.entity;

import lombok.Data;

@Data
public class TicketType {

    private Long id;

    private String name; // ADULT, CHILD

    private Double defaultPrice;

    private String description;

    private Boolean isActive = true;
}

