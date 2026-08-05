package com.jonwhitmer.portfolio.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    /**
     * The same configured address EmailService delivers to. Injected rather than written
     * here, because a literal in an error message is a second copy of the truth, and the
     * copy in the error path is the one nobody notices has gone stale.
     */
    @Value("${contact.email}")
    private String contactEmail;

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
            
            // Both numbers come from the service that enforces them. Stating a limit the
            // code does not enforce is worse than stating none.
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(String.format(
                        "Rate limit exceeded. You can send %d messages every %d minutes. Please try again in %d minutes.",
                        rateLimitService.getMaxRequests(),
                        rateLimitService.getWindowMinutes(),
                        minutesUntilReset + 1));
        }
        
        try {
            emailService.sendContactEmail(request);
            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            // This used to be an empty catch. A visitor's message would fail to send and
            // nothing anywhere recorded why — no log line, no stored copy, no alert. The
            // message was simply gone, and the only evidence was a 500 the sender saw.
            // The exception is the single most useful thing about that event; log it.
            log.error("Contact form delivery FAILED for {} <{}> — the message is lost. Cause follows.",
                    request.getFirstName(), request.getEmail(), e);

            // The address comes from the same configured value the mail actually goes to, so
            // the fallback offered here can never point somewhere different from the form.
            return ResponseEntity.status(500)
                    .body("Failed to send message. Please try again, or email directly at " + contactEmail);
        }
    }
}
