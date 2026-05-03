package com.zoo.booking.slot.controller;

import com.zoo.booking.slot.entity.Slot;
import com.zoo.booking.slot.repository.SlotRepository;
import com.zoo.booking.auth.security.SecurityConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/slots")
@Tag(name = "Slots", description = "Endpoints for managing zoo booking slots")
public class SlotController {

    @Autowired
    SlotRepository slotRepository;

    // Public endpoint for users to select available slots on a specific date
    @GetMapping("/available")
    @Operation(summary = "Get Available Slots", description = "Retrieve all available slots for a specific date")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Slots retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid date format")
    })
    public ResponseEntity<List<Slot>> getAvailableSlots(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Slot> slots = slotRepository.findBySlotDateAndIsActiveTrue(date);
        return ResponseEntity.ok(slots);
    }

    // Admin endpoint to create new slots for the day
    @PostMapping("/")
    @PreAuthorize(SecurityConstants.HAS_ADMIN_OR_SLOTS)
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Create New Slot", description = "Create a new booking slot (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Slot created successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<Slot> createSlot(@RequestBody Slot slot) {
        slot.setAvailableCapacity(slot.getTotalCapacity()); // Initialize available slots
        Slot saved = slotRepository.save(slot);
        return ResponseEntity.ok(saved);
    }

    // Admin endpoint to deactivate a slot
    @PutMapping("/{id}")
    @PreAuthorize(SecurityConstants.HAS_ADMIN_OR_SLOTS)
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Update Slot", description = "Update a slot's capacity or status (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Slot updated successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<Slot> updateSlot(@PathVariable Long id, @RequestBody Slot slotDetails) {
        Slot slot = slotRepository.findById(id).orElseThrow();
        slot.setIsActive(slotDetails.getIsActive());
        if(slotDetails.getTotalCapacity() != null) {
            slot.setTotalCapacity(slotDetails.getTotalCapacity());
        }
        return ResponseEntity.ok(slotRepository.save(slot));
    }

    // Admin endpoint to get all slots
    @GetMapping("/")
    @PreAuthorize(SecurityConstants.HAS_ADMIN_OR_SLOTS)
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Get All Slots", description = "Retrieve all slots (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Slots retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<List<Slot>> getAllSlots() {
        return ResponseEntity.ok(slotRepository.findAll());
    }
}
