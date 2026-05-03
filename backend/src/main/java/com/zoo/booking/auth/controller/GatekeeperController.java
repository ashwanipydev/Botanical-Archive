package com.zoo.booking.auth.controller;

import com.zoo.booking.auth.service.GatekeeperService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.zoo.booking.auth.security.SecurityConstants;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gatekeeper")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Gatekeeper", description = "Gatekeeper entry and exit verification")
public class GatekeeperController {

    private final GatekeeperService gatekeeperService;

    public GatekeeperController(GatekeeperService gatekeeperService) {
        this.gatekeeperService = gatekeeperService;
    }

    @GetMapping("/verify/{bookingId}")
    @Operation(summary = "Verify booking by ID", description = "Verifies if the ticket is valid for today and is confirmed")
    @PreAuthorize(SecurityConstants.HAS_GATEKEEPER_OR_ADMIN)
    public ResponseEntity<Map<String, Object>> verifyTicket(@PathVariable Long bookingId) {
        return ResponseEntity.ok(gatekeeperService.verifyTicket(bookingId));
    }

    @PostMapping("/check-in/{bookingId}")
    @Operation(summary = "Mark visitor as Checked In", description = "Records the entry time of the visitor")
    @PreAuthorize(SecurityConstants.HAS_GATEKEEPER_OR_ADMIN)
    public ResponseEntity<Map<String, Object>> checkIn(@PathVariable Long bookingId) {
        Map<String, Object> result = gatekeeperService.checkIn(bookingId);
        if (!(Boolean) result.get("success")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/check-out/{bookingId}")
    @Operation(summary = "Mark visitor as Checked Out", description = "Records the exit time of the visitor")
    @PreAuthorize(SecurityConstants.HAS_GATEKEEPER_OR_ADMIN)
    public ResponseEntity<Map<String, Object>> checkOut(@PathVariable Long bookingId) {
        Map<String, Object> result = gatekeeperService.checkOut(bookingId);
        if (!(Boolean) result.get("success")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/occupancy")
    @Operation(summary = "Get current zoo occupancy", description = "Returns the count of people currently inside the zoo")
    @PreAuthorize(SecurityConstants.HAS_GATEKEEPER_OR_ADMIN)
    public ResponseEntity<Map<String, Integer>> getOccupancy() {
        return ResponseEntity.ok(Map.of("occupancy", gatekeeperService.getCurrentOccupancy()));
    }
}
