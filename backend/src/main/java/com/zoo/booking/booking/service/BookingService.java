package com.zoo.booking.booking.service;
import com.zoo.booking.pricing.service.PricingService;
import com.zoo.booking.pricing.service.TicketService;
import com.zoo.booking.system.service.EmailService;

import com.zoo.booking.addons.entity.AddOn;
import com.zoo.booking.booking.entity.Booking;
import com.zoo.booking.booking.entity.BookingAudit;
import com.zoo.booking.slot.entity.Slot;
import com.zoo.booking.auth.entity.User;
import com.zoo.booking.auth.payload.request.CreateBookingRequest;
import com.zoo.booking.auth.payload.response.PriceBreakdownResponse;
import com.zoo.booking.addons.repository.AddOnRepository;
import com.zoo.booking.booking.repository.BookingAddOnRepository;
import com.zoo.booking.booking.repository.BookingAuditRepository;
import com.zoo.booking.booking.repository.BookingRepository;
import com.zoo.booking.slot.repository.SlotRepository;
import com.zoo.booking.auth.repository.UserRepository;
import com.zoo.booking.payment.service.RazorpayService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddOnRepository addOnRepository;

    @Autowired
    private BookingAddOnRepository bookingAddOnRepository;

    @Autowired
    private BookingAuditRepository bookingAuditRepository;

    @Autowired
    private PricingService pricingService;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private RazorpayService razorpayService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final int BOOKING_EXPIRY_MINUTES = 10;

    /**
     * Create a new pending booking with capacity reservation and payment initiation.
     * This uses pessimistic locking to prevent race conditions.
     */
    @Transactional
    public Booking initiateBooking(CreateBookingRequest request) {
        log.info("Initiating booking for slot: {}", request.getSlotId());

        // Get current user or handle guest
        User user = null;
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
            log.info("Booking with authenticated user: {}", email);
        } else if (request.getGuestEmail() != null) {
            // Guest booking
            String guestEmail = request.getGuestEmail();
            user = userRepository.findByEmail(guestEmail).orElse(null);
            
            if (user == null) {
                log.info("Creating new guest user for email: {}", guestEmail);
                user = new User();
                user.setEmail(guestEmail);
                user.setFullName(request.getGuestFullName());
                user.setMobileNumber(request.getGuestMobileNumber());
                // Password can be null for guest users
                user = userRepository.save(user);
            } else {
                log.info("Using existing user for guest booking: {}", guestEmail);
            }
        } else {
            throw new RuntimeException("Login required or guest information must be provided");
        }

        // Lock slot row using pessimistic lock to prevent concurrent overbooking
        Slot slot = slotRepository.findByIdForUpdate(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        // Validate request
        validateBookingRequest(request, slot);

        // Calculate price
        PriceBreakdownResponse priceBreakdown = pricingService.calculatePriceBreakdown(request);
        Double totalAmount = priceBreakdown.getTotalAmount();

        // Create booking with PENDING status
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setSlot(slot);
        booking.setAdultTickets(request.getAdultTickets());
        booking.setChildTickets(request.getChildTickets());
        booking.setTotalAmount(totalAmount);
        booking.setStatus("PENDING");
        booking.setExpiryTime(LocalDateTime.now().plusMinutes(BOOKING_EXPIRY_MINUTES));
        
        // Store guest details if it's a guest booking
        if (request.getGuestEmail() != null) {
            booking.setGuestFullName(request.getGuestFullName());
            booking.setGuestEmail(request.getGuestEmail());
            booking.setGuestMobileNumber(request.getGuestMobileNumber());
        }

        // Reserve add-on capacity (and keep booking summary fields in sync)
        List<ReservedAddOn> reservedAddOns = new ArrayList<>();
        int reservedCameraQty = 0;
        int reservedSafariQty = 0;

        if (request.getAddOns() != null) {
            List<CreateBookingRequest.AddOnRequest> addOnRequests = new ArrayList<>(request.getAddOns());
            addOnRequests.sort(Comparator.comparing(CreateBookingRequest.AddOnRequest::getAddOnId));

            for (CreateBookingRequest.AddOnRequest addOnReq : addOnRequests) {
                if (addOnReq.getQuantity() == null || addOnReq.getQuantity() <= 0) {
                    continue;
                }

                AddOn reserved = validateAndReserveAddOnCapacity(addOnReq.getAddOnId(), addOnReq.getQuantity());
                reservedAddOns.add(new ReservedAddOn(
                        reserved.getId(),
                        reserved.getName(),
                        addOnReq.getQuantity(),
                        BigDecimal.valueOf(reserved.getPrice() != null ? reserved.getPrice() : 0.0)
                ));

                if ("Camera".equalsIgnoreCase(reserved.getName())) {
                    reservedCameraQty += addOnReq.getQuantity();
                } else if ("Safari".equalsIgnoreCase(reserved.getName())) {
                    reservedSafariQty += addOnReq.getQuantity();
                }
            }
        }

        booking.setAddOnCamera(reservedCameraQty);
        booking.setAddOnSafari(reservedSafariQty);

        // Deduct slot capacity (temporary reservation)
        int totalTickets = request.getAdultTickets() + request.getChildTickets();
        if (slot.getAvailableCapacity() < totalTickets) {
            throw new RuntimeException("Not enough capacity available");
        }
        slot.setAvailableCapacity(slot.getAvailableCapacity() - totalTickets);
        slotRepository.save(slot);

        // Save booking
        booking = bookingRepository.save(booking);

        // Persist normalized add-ons for this booking
        for (ReservedAddOn reserved : reservedAddOns) {
            bookingAddOnRepository.insert(booking.getId(), reserved.addOnId(), reserved.quantity(), reserved.unitPrice());
        }

        // Create audit log
        createAuditLog(booking, request, priceBreakdown, "CREATED", null);

        // Initiate payment (real Razorpay order)
        try {
            String receipt = "receipt_" + booking.getId();
            String razorpayOrderId = razorpayService.createOrder(totalAmount, "INR", receipt);
            booking.setRazorpayOrderId(razorpayOrderId);
            booking = bookingRepository.save(booking);
            log.info("Booking initiated successfully with real Razorpay order ID: {}", razorpayOrderId);
        } catch (Exception e) {
            log.error("Error creating Razorpay order for booking: {}", booking.getId(), e);
            // We still have the booking in PENDING status, but without an order ID.
            // In a real scenario, we might want to fail the booking here or handle it.
            throw new RuntimeException("Payment initiation failed: " + e.getMessage());
        }

        return booking;
    }

    /**
     * Confirm booking after successful payment via webhook.
     * This should only be called after payment verification.
     */
    @Transactional
    public Booking confirmBooking(Long bookingId, String paymentId) {
        log.info("Confirming booking: {} with payment: {}", bookingId, paymentId);

        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new RuntimeException("Booking status is not PENDING");
        }

        // Update booking status
        booking.setStatus("CONFIRMED");
        booking.setRazorpayPaymentId(paymentId);
        booking = bookingRepository.save(booking);

        // Generate ticket
        try {
            String pdfUrl = generateTicketPdf(booking);
            booking.setPdfUrl(pdfUrl);
            bookingRepository.updatePdfUrl(booking.getId(), pdfUrl);
        } catch (Exception e) {
            log.error("Error generating ticket for booking: {}", bookingId, e);
        }

        createAuditLog(booking, null, null, "PAYMENT_SUCCESS", null);
        
        // Send email confirmation
        try {
            emailService.sendBookingConfirmation(booking);
        } catch (Exception e) {
            log.error("Error sending email for booking: {}", bookingId, e);
        }

        log.info("Booking confirmed successfully: {}", bookingId);

        return booking;
    }

    /**
     * Fail a booking and release capacity.
     * This is called when payment fails or booking expires.
     */
    @Transactional
    public Booking failBooking(Long bookingId, String reason) {
        log.warn("Failing booking: {} - Reason: {}", bookingId, reason);

        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if ("CONFIRMED".equals(booking.getStatus())) {
            log.error("Cannot fail a confirmed booking: {}", bookingId);
            throw new RuntimeException("Cannot fail a confirmed booking");
        }

        if (!"PENDING".equals(booking.getStatus())) {
            // Already failed/expired - avoid double releasing capacity
            return booking;
        }

        // Release slot capacity
        Slot slot = slotRepository.findByIdForUpdate(booking.getSlot().getId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        int totalTickets = booking.getAdultTickets() + booking.getChildTickets();
        slot.setAvailableCapacity(slot.getAvailableCapacity() + totalTickets);
        slotRepository.save(slot);

        // Release add-on capacity
        releaseAddOnCapacity(booking.getId());

        // Update booking status
        booking.setStatus("BOOKING_EXPIRED".equals(reason) ? "EXPIRED" : "FAILED");
        booking = bookingRepository.save(booking);

        createAuditLog(booking, null, null, "PAYMENT_FAILED", reason);
        log.info("Booking failed and capacity released: {}", bookingId);

        return booking;
    }

    /**
     * Validate booking request for feasibility.
     */
    private void validateBookingRequest(CreateBookingRequest request, Slot slot) {
        if (request.getAdultTickets() < 1) {
            throw new RuntimeException("At least 1 adult ticket is required");
        }

        int totalTickets = request.getAdultTickets() + request.getChildTickets();
        if (totalTickets > slot.getAvailableCapacity()) {
            throw new RuntimeException("Not enough capacity. Available: " + slot.getAvailableCapacity());
        }
    }

    /**
     * Validate add-on capacity and reserve it.
     */
    private AddOn validateAndReserveAddOnCapacity(Long addOnId, Integer quantity) {
        AddOn addOn = addOnRepository.findByIdForUpdate(addOnId)
                .orElseThrow(() -> new RuntimeException("Add-on not found"));

        if (Boolean.FALSE.equals(addOn.getIsActive())) {
            throw new RuntimeException("Add-on is not active: " + addOn.getName());
        }

        if (addOn.getMaxLimitPerBooking() != null && quantity > addOn.getMaxLimitPerBooking()) {
            throw new RuntimeException("Add-on quantity exceeds limit: " + addOn.getName());
        }

        if (addOn.getAvailableCapacity() != null) {
            int currentBooked = addOn.getBookedCapacity() != null ? addOn.getBookedCapacity() : 0;
            int availableSpace = addOn.getAvailableCapacity() - currentBooked;
            if (quantity > availableSpace) {
                throw new RuntimeException("Add-on capacity exhausted: " + addOn.getName());
            }

            addOn.setBookedCapacity(currentBooked + quantity);
            addOnRepository.save(addOn);
        }

        return addOn;
    }

    /**
     * Release add-on capacity when booking fails.
     */
    private void releaseAddOnCapacity(Long bookingId) {
        List<BookingAddOnRepository.BookingAddOnReservation> reservations = bookingAddOnRepository.findByBookingId(bookingId);
        if (reservations.isEmpty()) {
            return;
        }

        reservations.sort(Comparator.comparing(BookingAddOnRepository.BookingAddOnReservation::addOnId));

        for (BookingAddOnRepository.BookingAddOnReservation reservation : reservations) {
            if (reservation.quantity() == null || reservation.quantity() <= 0) {
                continue;
            }

            AddOn addOn = addOnRepository.findByIdForUpdate(reservation.addOnId())
                    .orElse(null);
            if (addOn == null) {
                continue;
            }

            if (addOn.getAvailableCapacity() != null) {
                int currentBooked = addOn.getBookedCapacity() != null ? addOn.getBookedCapacity() : 0;
                int updatedBooked = Math.max(0, currentBooked - reservation.quantity());
                addOn.setBookedCapacity(updatedBooked);
                addOnRepository.save(addOn);
            }
        }
    }

    /**
     * Create audit log for booking transaction.
     */
    private void createAuditLog(Booking booking, CreateBookingRequest request,
                               PriceBreakdownResponse priceBreakdown,
                               String status, String errorMessage) {
        try {
            BookingAudit audit = new BookingAudit();
            audit.setBookingId(booking.getId());
            audit.setStatus(status);
            audit.setErrorMessage(errorMessage);

            if (request != null) {
                audit.setRequestPayload(objectMapper.writeValueAsString(request));
            }

            if (priceBreakdown != null) {
                audit.setPriceBreakdown(objectMapper.writeValueAsString(priceBreakdown));
            }

            bookingAuditRepository.save(audit);
        } catch (Exception e) {
            log.error("Error creating audit log for booking: {}", booking.getId(), e);
        }
    }

    /**
     * Generate PDF ticket using TicketService.
     */
    private String generateTicketPdf(Booking booking) throws Exception {
        String fileName = ticketService.generatePdfTicket(booking);
        return "/api/bookings/ticket/" + fileName;
    }

    private record ReservedAddOn(Long addOnId, String addOnName, Integer quantity, BigDecimal unitPrice) {}
}

