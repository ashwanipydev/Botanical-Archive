package com.zoo.booking.pricing.controller;

import com.zoo.booking.addons.entity.AddOn;
import com.zoo.booking.addons.service.AddOnService;
import com.zoo.booking.pricing.service.PricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/pricing")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Public Pricing", description = "Publicly accessible pricing information")
public class PricingController {

    private final PricingService pricingService;
    private final AddOnService addOnService;

    public PricingController(PricingService pricingService, AddOnService addOnService) {
        this.pricingService = pricingService;
        this.addOnService = addOnService;
    }

    @GetMapping("/tickets")
    @Operation(summary = "Get ticket prices (optionally slot-specific)")
    public ResponseEntity<Map<String, Double>> getTicketPrices(@org.springframework.web.bind.annotation.RequestParam(required = false) Long slotId) {
        return ResponseEntity.ok(pricingService.resolvePricesForSlot(slotId));
    }

    @GetMapping("/addons")
    @Operation(summary = "Get active add-on prices")
    public ResponseEntity<List<AddOn>> getAddOnPrices() {
        return ResponseEntity.ok(addOnService.getActiveAddOns());
    }
}
