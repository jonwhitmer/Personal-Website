package com.jonwhitmer.portfolio.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.jonwhitmer.portfolio.dto.ContactRequest;
import com.jonwhitmer.portfolio.service.EmailService;
import com.jonwhitmer.portfolio.service.RateLimitService;
import com.jonwhitmer.portfolio.util.IpAddressExtractor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {
    private final EmailService emailService;
    private final RateLimitService rateLimitService;
    private final IpAddressExtractor ipExtractor;

    @PostMapping
    public ResponseEntity<String> sendContactEmail(
            @Valid @RequestBody ContactRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("=== CONTACT FORM SUBMISSION STARTED ===");
        log.info("Request received from: {}", httpRequest.getRemoteAddr());
        log.info("Contact details - Name: {} {}, Email: {}, Company: {}", 
            request.getFirstName(), 
            request.getLastName(), 
            request.getEmail(),
            request.getCompany());
        // Get the real IP address of the client
        String clientIp = ipExtractor.getClientIpAddress(httpRequest);
        
        // Check if IP has exceeded the rate limit
        if (!rateLimitService.isAllowed(clientIp)) {
            long secondsUntilReset = rateLimitService.getSecondsUntilReset(clientIp);
            long minutesUntilReset = secondsUntilReset / 60;
            
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(String.format(
                        "Rate limit exceeded. You can send 1 email every 30 minutes. Please try again in %d minutes.",
                        minutesUntilReset + 1));
        }
        
        try {
            emailService.sendContactEmail(request);
            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Failed to send message. Please try again or email directly at jonmwhitmer@gmail.com");
        }
    }
}
