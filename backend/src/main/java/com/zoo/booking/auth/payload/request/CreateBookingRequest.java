package com.zoo.booking.auth.payload.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateBookingRequest {

    @NotNull
    private Long slotId;

    @NotNull
    @Min(1)
    private Integer adultTickets;

    @NotNull
    @Min(0)
    private Integer childTickets;

    private List<AddOnRequest> addOns;
    
    // Guest information for unauthenticated bookings
    private String guestFullName;
    private String guestEmail;
    private String guestMobileNumber;


    @Data
    public static class AddOnRequest {
        @NotNull
        private Long addOnId;

        @NotNull
        @Min(0)
        private Integer quantity;
    }
}

