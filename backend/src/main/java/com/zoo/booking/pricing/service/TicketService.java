package com.zoo.booking.pricing.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.zoo.booking.booking.entity.Booking;
import net.sf.jasperreports.engine.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TicketService {

    private final String ticketDir;
    private JasperReport jasperReport;
    private final PricingService pricingService;
    private final com.zoo.booking.addons.repository.AddOnRepository addOnRepository;
    private final com.zoo.booking.booking.repository.BookingAddOnRepository bookingAddOnRepository;

    public TicketService(@org.springframework.beans.factory.annotation.Value("${app.tickets.dir}") String ticketDir,
                         PricingService pricingService,
                         com.zoo.booking.addons.repository.AddOnRepository addOnRepository,
                         com.zoo.booking.booking.repository.BookingAddOnRepository bookingAddOnRepository) {
        this.ticketDir = ticketDir;
        this.pricingService = pricingService;
        this.addOnRepository = addOnRepository;
        this.bookingAddOnRepository = bookingAddOnRepository;
        try {
            Path path = Paths.get(this.ticketDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                System.out.println("✅ Created tickets directory at: " + path.toAbsolutePath());
            }
            
            // Pre-compile the report for performance
            InputStream reportStream = new ClassPathResource("reports/ticket.jrxml").getInputStream();
            this.jasperReport = JasperCompileManager.compileReport(reportStream);
            System.out.println("✅ JasperReport compiled successfully.");
        } catch (Exception e) {
            System.err.println("❌ Failed to initialize TicketService or compile JasperReport: " + e.getMessage());
        }
    }

    public static class TicketItem {
        private String itemName;
        private String itemQty;
        private String itemPrice;
        private String itemSubtotal;

        public TicketItem(String itemName, String itemQty, String itemPrice, String itemSubtotal) {
            this.itemName = itemName;
            this.itemQty = itemQty;
            this.itemPrice = itemPrice;
            this.itemSubtotal = itemSubtotal;
        }

        public String getItemName() { return itemName; }
        public String getItemQty() { return itemQty; }
        public String getItemPrice() { return itemPrice; }
        public String getItemSubtotal() { return itemSubtotal; }
    }

    public byte[] generateQRCodeImage(String text) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 200, 200);
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }

    public String generatePdfTicket(Booking booking) throws Exception {
        String fileName = "Ticket_" + booking.getId() + ".pdf";
        String filePath = this.ticketDir + fileName;

        try {
            // Prepare parameters
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("bookingId", booking.getId());
            parameters.put("fullName", booking.getUser().getFullName() != null ? booking.getUser().getFullName() : (booking.getGuestFullName() != null ? booking.getGuestFullName() : "Guest"));
            parameters.put("visitDate", booking.getSlot().getSlotDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")));
            parameters.put("timeSlot", booking.getSlot().getStartTime() + " - " + booking.getSlot().getEndTime());
            
            // Build dynamic items list
            List<TicketItem> items = new ArrayList<>();
            
            // Get current prices for base tickets
            Map<String, Double> prices = pricingService.resolvePricesForSlot(booking.getSlot().getId());
            double adultPrice = prices.getOrDefault("ADULT", 800.0);
            double childPrice = prices.getOrDefault("CHILD", 500.0);
            
            int adultCount = booking.getAdultTickets() != null ? booking.getAdultTickets() : 0;
            int childCount = booking.getChildTickets() != null ? booking.getChildTickets() : 0;

            if (adultCount > 0) {
                items.add(new TicketItem("Adult Ticket", String.valueOf(adultCount), 
                    String.format("%.2f", adultPrice), String.format("%.2f", adultPrice * adultCount)));
            }
            if (childCount > 0) {
                items.add(new TicketItem("Child Ticket", String.valueOf(childCount), 
                    String.format("%.2f", childPrice), String.format("%.2f", childPrice * childCount)));
            }

            // Fetch all add-ons for this booking from DB
            List<com.zoo.booking.booking.repository.BookingAddOnRepository.BookingAddOnReservation> addons = 
                bookingAddOnRepository.findByBookingId(booking.getId());
            
            for (com.zoo.booking.booking.repository.BookingAddOnRepository.BookingAddOnReservation addon : addons) {
                if (addon.quantity() != null && addon.quantity() > 0) {
                    double subtotal = addon.unitPrice().doubleValue() * addon.quantity();
                    items.add(new TicketItem(addon.addOnName(), String.valueOf(addon.quantity()), 
                        String.format("%.2f", addon.unitPrice()), String.format("%.2f", subtotal)));
                }
            }

            // Calculate total from items
            double calculatedSubtotal = (adultPrice * adultCount) + (childPrice * childCount);
            for (com.zoo.booking.booking.repository.BookingAddOnRepository.BookingAddOnReservation addon : addons) {
                calculatedSubtotal += addon.unitPrice().doubleValue() * (addon.quantity() != null ? addon.quantity() : 0);
            }
            
            double convenienceFee = 100.0; 
            double totalAmount = calculatedSubtotal + convenienceFee;

            // GST Calculation (5% example)
            double taxAmount = totalAmount * (5.0 / 105.0); // Assuming total is tax-inclusive
            
            parameters.put("convenienceFee", String.format("%.2f", convenienceFee));
            parameters.put("taxAmount", String.format("%.2f", taxAmount));
            parameters.put("totalAmount", String.format("%.2f", totalAmount));
            parameters.put("amountInWords", com.zoo.booking.util.NumberToWordsConverter.convertAmountToWords(totalAmount));

            // Generate QR Code as InputStream
            byte[] qrCodeBytes = generateQRCodeImage("ZOO-BOOKING-" + booking.getId());
            parameters.put("qrCode", new ByteArrayInputStream(qrCodeBytes));

            // Create Data Source from dynamic items
            net.sf.jasperreports.engine.data.JRBeanCollectionDataSource dataSource = 
                new net.sf.jasperreports.engine.data.JRBeanCollectionDataSource(items);

            // Fill the report
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            // Export to PDF
            JasperExportManager.exportReportToPdfFile(jasperPrint, filePath);
            return fileName;

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ Error generating JasperReport PDF: " + e.getMessage());
            throw e;
        }
    }

}
