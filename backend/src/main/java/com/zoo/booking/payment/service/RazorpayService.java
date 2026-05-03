package com.zoo.booking.payment.service;

import com.razorpay.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class RazorpayService {

	private final RazorpayClient razorpayClient;

	@Value("${razorpay.key.secret}")
	private String razorpayKeySecret;

	public RazorpayService(RazorpayClient razorpayClient) {
		this.razorpayClient = razorpayClient;
	}

	// Create Razorpay Order
	public String createOrder(Double amount, String currency, String receipt) throws RazorpayException {
		JSONObject orderRequest = new JSONObject();
		orderRequest.put("amount", Math.round(amount * 100)); // Amount in paise as long
		orderRequest.put("currency", currency);
		orderRequest.put("receipt", receipt);
		orderRequest.put("payment_capture", true);

		Order order = razorpayClient.orders.create(orderRequest);
		return order.get("id").toString();
	}


    public Map<String, String> verifyPayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isValid) {
                return Map.of(
                        "status", "FAILED",
                        "message", "Invalid signature"
                );
            }

            return Map.of(
                    "status", "SUCCESS",
                    "paymentId", razorpayPaymentId
            );

        } catch (Exception e) {
            return Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()
            );
        }
    }

	
	

}
