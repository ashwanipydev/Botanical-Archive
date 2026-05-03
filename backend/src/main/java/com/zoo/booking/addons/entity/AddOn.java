package com.zoo.booking.addons.entity;

import lombok.Data;

@Data
public class AddOn {

    private Long id;

    private String name; // Camera, Safari

    private String type; // PER_BOOKING or PER_PERSON

    private Double price;

    private Integer maxLimitPerBooking; // Max quantity per booking

    private Integer availableCapacity; // Total available (null = unlimited)

    private Integer bookedCapacity = 0; // Currently booked

    private String description;
    private String imageUrl;
    private Boolean isActive = true;
}

