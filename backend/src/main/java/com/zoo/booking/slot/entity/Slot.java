package com.zoo.booking.slot.entity;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class Slot {

    private Long id;

    private LocalDate slotDate;
    
    private LocalTime startTime;
    
    private LocalTime endTime;

    private Integer totalCapacity;
    
    private Integer availableCapacity;

    private Boolean isActive = true;
}
