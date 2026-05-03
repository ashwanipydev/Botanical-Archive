package com.zoo.booking.booking.controller;
import com.zoo.booking.slot.entity.Slot;

import com.zoo.booking.booking.entity.Booking;
import com.zoo.booking.auth.entity.User;
import com.zoo.booking.auth.payload.request.CreateBookingRequest;
import com.zoo.booking.booking.repository.BookingRepository;
import com.zoo.booking.slot.repository.SlotRepository;
import com.zoo.booking.auth.repository.UserRepository;
import com.zoo.booking.booking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Endpoints for managing zoo ticket bookings")
public class BookingController {

    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    SlotRepository slotRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    BookingService bookingService;

    @PostMapping("/initiate")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Initiate Booking", description = "Initiate a new booking for the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Booking initiated successfully"),
        @ApiResponse(responseCode = "400", description = "Slot not found or invalid request"),
        @ApiResponse(responseCode = "409", description = "Not enough capacity in selected slot")
    })
    public ResponseEntity<?> initiateBooking(@RequestBody CreateBookingRequest bookingRequest) {
        try {
            Booking savedBooking = bookingService.initiateBooking(bookingRequest);
            return ResponseEntity.ok(savedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-bookings")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Get User's Bookings", description = "Retrieve all bookings for the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully")
    })
    public ResponseEntity<List<Booking>> getUserBookings() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = ((UserDetails) principal).getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();

        return ResponseEntity.ok(bookingRepository.findByUser(user));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_BOOKINGS')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Get All Bookings", description = "Retrieve all bookings (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    @GetMapping("/ticket/{fileName}")
    @Operation(summary = "Download Ticket", description = "Download ticket PDF by file name")
    public ResponseEntity<Resource> downloadTicket(@PathVariable String fileName) {
        try {
            if (fileName == null || fileName.isBlank()) {
                return ResponseEntity.badRequest().build();
            }

            Path ticketDir = Paths.get("tickets").toAbsolutePath().normalize();
            Path resolved = ticketDir.resolve(fileName).normalize();
            if (!resolved.startsWith(ticketDir)) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(resolved.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
