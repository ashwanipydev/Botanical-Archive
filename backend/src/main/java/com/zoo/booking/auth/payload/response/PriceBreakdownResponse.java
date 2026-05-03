package com.zoo.booking.auth.payload.response;

import lombok.Data;

import java.util.List;

@Data
public class PriceBreakdownResponse {

    private Double adultPrice;
    private Integer adultCount;
    private Double adultSubtotal;

    private Double childPrice;
    private Integer childCount;
    private Double childSubtotal;

    private List<AddOnBreakdown> addOns;

    private Double totalAmount;

    @Data
    public static class AddOnBreakdown {
        private Long addOnId;
        private String addOnName;
        private String addOnType; // PER_BOOKING or PER_PERSON
        private Double price;
        private Integer quantity;
        private Double subtotal;
    }
}

