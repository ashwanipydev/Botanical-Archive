package com.zoo.booking.addons.controller;

import com.zoo.booking.addons.entity.AddOn;
import com.zoo.booking.addons.service.AddOnService;
import com.zoo.booking.auth.security.SecurityConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/addons")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Add-On", description = "Add-on management endpoints")
@PreAuthorize(SecurityConstants.HAS_ADMIN_OR_PRICING)
public class AddOnController {

    private final AddOnService addOnService;

    public AddOnController(AddOnService addOnService) {
        this.addOnService = addOnService;
    }

    @GetMapping
    @Operation(summary = "Get all add-ons")
    public ResponseEntity<List<AddOn>> getAllAddOns() {
        return ResponseEntity.ok(addOnService.getAllAddOns());
    }

    @PostMapping
    @Operation(summary = "Create an add-on")
    public ResponseEntity<AddOn> createAddOn(@RequestBody AddOn addOn) {
        return ResponseEntity.ok(addOnService.createAddOn(addOn));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing add-on")
    public ResponseEntity<AddOn> updateAddOn(@PathVariable Long id, @RequestBody AddOn addOn) {
        return ResponseEntity.ok(addOnService.updateAddOn(id, addOn));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle add-on active status")
    public ResponseEntity<AddOn> toggleAddOn(@PathVariable Long id) {
        return ResponseEntity.ok(addOnService.toggleAddOn(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an add-on")
    public ResponseEntity<?> deleteAddOn(@PathVariable Long id) {
        addOnService.deleteAddOn(id);
        return ResponseEntity.ok().build();
    }
}
