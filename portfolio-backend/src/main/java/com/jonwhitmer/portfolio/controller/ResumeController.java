package com.jonwhitmer.portfolio.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonwhitmer.portfolio.dto.ResumeEmailRequest;
import com.jonwhitmer.portfolio.service.EmailService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping("/email")
    public ResponseEntity<String> emailResume(@Valid @RequestBody ResumeEmailRequest request) {
        try {
            emailService.sendResumeEmail(request.getEmail());
            return ResponseEntity.ok("Resume sent successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send resume");
        }
    }
}
