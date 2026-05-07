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
import java.util.HashMap;
import java.util.Map;

@Service
public class TicketService {

    private final String TICKET_DIR = "tickets/";
    private JasperReport jasperReport;

    public TicketService() {
        try {
            Path path = Paths.get(TICKET_DIR);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
            
            // Pre-compile the report for performance
            InputStream reportStream = new ClassPathResource("reports/ticket.jrxml").getInputStream();
            this.jasperReport = JasperCompileManager.compileReport(reportStream);
        } catch (Exception e) {
            System.err.println("❌ Failed to initialize TicketService or compile JasperReport: " + e.getMessage());
            e.printStackTrace();
        }
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
        String filePath = TICKET_DIR + fileName;

        try {
            // Prepare parameters
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("bookingId", booking.getId());
            parameters.put("fullName", booking.getUser().getFullName() != null ? booking.getUser().getFullName() : "Guest");
            parameters.put("visitDate", booking.getSlot().getSlotDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")));
            parameters.put("timeSlot", booking.getSlot().getStartTime() + " - " + booking.getSlot().getEndTime());
            parameters.put("adultCount", booking.getAdultTickets() != null ? booking.getAdultTickets() : 0);
            parameters.put("childCount", booking.getChildTickets() != null ? booking.getChildTickets() : 0);
            parameters.put("totalAmount", String.format("%.2f", booking.getTotalAmount()));

            // Generate QR Code as InputStream
            byte[] qrCodeBytes = generateQRCodeImage("ZOO-BOOKING-" + booking.getId());
            parameters.put("qrCode", new ByteArrayInputStream(qrCodeBytes));

            // Fill the report
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, new JREmptyDataSource());

            // Export to PDF
            JasperExportManager.exportReportToPdfFile(jasperPrint, filePath);

            return fileName;
        } catch (Exception e) {
            System.err.println("❌ Error generating JasperReport PDF: " + e.getMessage());
            throw e;
        }
    }
}
