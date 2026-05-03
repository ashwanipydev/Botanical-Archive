package com.zoo.booking.pricing.service;
import com.zoo.booking.slot.entity.Slot;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.text.Document;
import com.itextpdf.text.Image;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import com.zoo.booking.booking.entity.Booking;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

@Service
public class TicketService {

    private final String TICKET_DIR = "tickets/";

    public TicketService() {
        try {
            Path path = Paths.get(TICKET_DIR);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (Exception e) {
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

        Document document = new Document();
        PdfWriter.getInstance(document, new FileOutputStream(filePath));
        document.open();

        document.add(new Paragraph("Zoo Ticket Booking System"));
        document.add(new Paragraph("Booking ID: " + booking.getId()));
        document.add(new Paragraph("Name: " + booking.getUser().getFullName()));
        document.add(new Paragraph("Date: " + booking.getSlot().getSlotDate().format(DateTimeFormatter.ISO_DATE)));
        document.add(new Paragraph("Time Slot: " + booking.getSlot().getStartTime() + " to " + booking.getSlot().getEndTime()));
        
        document.add(new Paragraph("Adults: " + booking.getAdultTickets()));
        document.add(new Paragraph("Children: " + booking.getChildTickets()));
        document.add(new Paragraph("Safari Add-on: " + booking.getAddOnSafari()));
        document.add(new Paragraph("Camera Add-on: " + booking.getAddOnCamera()));
        
        document.add(new Paragraph("Total Price: ₹ " + booking.getTotalAmount()));

        byte[] qrCodeBytes = generateQRCodeImage("BOOKING_ID:" + booking.getId());
        Image qrImage = Image.getInstance(qrCodeBytes);
        qrImage.setAlignment(Image.ALIGN_CENTER);
        document.add(qrImage);

        document.close();
        return fileName;
    }
}
