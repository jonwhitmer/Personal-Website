package com.jonwhitmer.portfolio.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.jonwhitmer.portfolio.dto.ContactRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${contact.email:jonmwhitmer@gmail.com}")
    private String toEmail;

    public void sendContactEmail(ContactRequest request) {
        log.info("Sending contact email from: {} {}", request.getFirstName(), request.getLastName());
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            
            helper.setSubject(String.format("New Portfolio Contact Form Submission - %s %s", 
                request.getFirstName(), request.getLastName()));
            
            String htmlBody = buildContactEmailHtml(request);
            helper.setText(htmlBody, true);
            
            mailSender.send(message);
            log.info("Contact email sent successfully");
            
        } catch (Exception e) {
            log.error("Failed to send contact email", e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildContactEmailHtml(ContactRequest request) {
        LocalDateTime now = LocalDateTime.now();
        String timestamp = now.format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a"));
        
        String company = (request.getCompany() != null && !request.getCompany().trim().isEmpty()) 
            ? request.getCompany() 
            : "Not provided";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="color-scheme" content="light">
                <meta name="supported-color-schemes" content="light">
                <style>
                    @media (prefers-color-scheme: dark) {
                        .dark-safe { color: #000000 !important; }
                        .bg-white { background-color: #ffffff !important; }
                        .bg-light { background-color: #f8f9fa !important; }
                        .bg-blue { background-color: #e7f3ff !important; }
                    }
                </style>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;" class="bg-white">
                <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin-bottom: 20px;" class="bg-light">
                    <h2 style="margin: 0 0 10px 0; color: #007bff;">New Contact Form Submission</h2>
                    <p style="margin: 0; color: #000000; font-size: 14px;" class="dark-safe">Received on %s</p>
                </div>
                
                <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 4px;" class="bg-white">
                    <table style="width: 100%%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                                <strong style="color: #000000;" class="dark-safe">Name:</strong>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; color: #000000;" class="dark-safe">
                                %s %s
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                                <strong style="color: #000000;" class="dark-safe">Email:</strong>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                                <a href="mailto:%s" style="color: #007bff; text-decoration: none;">%s</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                                <strong style="color: #000000;" class="dark-safe">Company:</strong>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; color: #000000;" class="dark-safe">
                                %s
                            </td>
                        </tr>
                    </table>
                    
                    <div style="margin-top: 20px;">
                        <strong style="color: #000000;" class="dark-safe">Message:</strong>
                        <div style="background-color: #f8f9fa; padding: 15px; margin-top: 10px; border-radius: 4px; white-space: pre-wrap; color: #000000;" class="bg-light dark-safe">%s</div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 4px;" class="bg-blue">
                    <p style="margin: 0; font-size: 14px; color: #000000;" class="dark-safe">
                        💡 <strong>Tip:</strong> Reply directly to <a href="mailto:%s" style="color: #007bff;">%s</a> to respond to this inquiry.
                    </p>
                </div>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #000000; font-size: 12px;" class="dark-safe">
                    <p>This message was sent from your portfolio contact form at jonwhitmer.com</p>
                </div>
            </body>
            </html>
            """, 
            timestamp,
            escapeHtml(request.getFirstName()), 
            escapeHtml(request.getLastName()),
            request.getEmail(),
            request.getEmail(),
            escapeHtml(company),
            escapeHtml(request.getMessage()),
            request.getEmail(),
            request.getEmail()
        );
    }

    public void sendResumeEmail(String recipientEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("Jon Whitmer - Resume");

            String emailContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
                    
                    <!-- Header Section -->
                    <div style="background: linear-gradient(135deg, #000000 0%, #2d2d2d 100%); padding: 40px 30px; text-align: center; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 30px;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);">Jon Whitmer</h1>
                        <div style="width: 60px; height: 2px; background-color: #ffffff; margin: 15px auto;"></div>
                        <p style="color: #e0e0e0; margin: 0; font-size: 16px; font-weight: 400; letter-spacing: 0.5px;">Software Engineer</p>
                    </div>
                    
                    <!-- Content Section -->
                    <div style="background-color: #f8f9fa; padding: 35px 30px; border-radius: 12px; border: 1px solid #e0e0e0; margin-bottom: 25px;">
                        <p style="margin: 0 0 20px 0; font-size: 16px; color: #1a1a1a;">Thank you for your interest in my professional background!</p>
                        
                        <p style="margin: 0 0 20px 0; font-size: 16px; color: #1a1a1a;">Please find my resume attached to this email. I look forward to connecting with you.</p>
                        
                        <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #d0d0d0;">
                            <p style="margin: 0; font-size: 16px; color: #1a1a1a; line-height: 1.8;">
                                Best regards,<br>
                                <strong style="font-weight: 600;">Jon Whitmer</strong>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer Section -->
                    <div style="text-align: center; padding: 20px 0;">
                        <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.5;">
                            This email was sent from <strong>jonwhitmer.com</strong>
                        </p>
                    </div>
                    
                </body>
                </html>
            """;
            
            helper.setText(emailContent, true);

            ClassPathResource resumeFile = new ClassPathResource("static/JonWhitmer_Resume.pdf");
            helper.addAttachment("JonWhitmer_Resume.pdf", resumeFile);

            mailSender.send(message);
            log.info("Resume email sent successfully to {}", recipientEmail);

            // Send notification to self
            sendResumeNotificationEmail(recipientEmail);

        } catch (Exception e) {
            log.error("Failed to send resume email to {}: {}", recipientEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send resume email", e);
        }
    }
    
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#x27;");
    }

    private void sendResumeNotificationEmail(String recipientEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Resume Request Notification - " + recipientEmail);

            LocalDateTime now = LocalDateTime.now();
            String timestamp = now.format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a"));

            String notificationContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta name="color-scheme" content="light">
                    <meta name="supported-color-schemes" content="light">
                    <style>
                        @media (prefers-color-scheme: dark) {
                            .dark-safe { color: #000000 !important; }
                            .bg-white { background-color: #ffffff !important; }
                            .bg-light { background-color: #f8f9fa !important; }
                            .bg-green { background-color: #d4edda !important; }
                        }
                    </style>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;" class="bg-white">
                    
                    <!-- Header Section -->
                    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 30px; text-align: center; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 30px;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);">✓ Resume Sent Successfully</h1>
                        <p style="color: #e8f5e9; margin: 10px 0 0 0; font-size: 14px;">Notification from jonwhitmer.com</p>
                    </div>
                    
                    <!-- Content Section -->
                    <div style="background-color: #f8f9fa; padding: 35px 30px; border-radius: 12px; border: 1px solid #e0e0e0; margin-bottom: 25px;" class="bg-light">
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #1a1a1a;" class="dark-safe">
                            Your resume was successfully sent to the following email address:
                        </p>
                        
                        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 25px;" class="bg-white">
                            <strong style="color: #1a1a1a; font-size: 18px;" class="dark-safe">EMAIL_PLACEHOLDER</strong>
                        </div>
                        
                        <div style="padding: 15px; background-color: #d4edda; border-radius: 8px; border: 1px solid #c3e6cb;" class="bg-green">
                            <p style="margin: 0; font-size: 14px; color: #155724;" class="dark-safe">
                                <strong>Timestamp:</strong> TIMESTAMP_PLACEHOLDER
                            </p>
                        </div>
                    </div>
                    
                    <!-- Info Box -->
                    <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin-bottom: 25px;">
                        <p style="margin: 0; font-size: 14px; color: #004085;" class="dark-safe">
                            <strong>Next Steps:</strong> The recipient has received your resume with the PDF attachment. You may want to follow up with them directly.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.5;">
                            This is an automated notification from your portfolio website
                        </p>
                    </div>
                    
                </body>
                </html>
                """;

            // placeholder -> actual values
            notificationContent = notificationContent
                .replace("EMAIL_PLACEHOLDER", escapeHtml(recipientEmail))
                .replace("TIMESTAMP_PLACEHOLDER", timestamp);

            helper.setText(notificationContent, true);
            mailSender.send(message);
            
            log.info("Resume notification email sent to {} about request from {}", toEmail, recipientEmail);

        } catch (Exception e) {
            // Log but don't throw - notification failure shouldn't break the main resume send
            log.error("Failed to send resume notification email: {}", e.getMessage(), e);
        }
    }
}