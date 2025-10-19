package com.jonwhitmer.portfolio.config;

import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class CorsConfig {

    @Value("${APP_ALLOWED_ORIGINS:}")
    private String envAllowedOrigins;

    @Value("${app.allowed-origins:}")
    private String propAllowedOrigins;

    private String[] resolveOrigins() {
        String raw = (envAllowedOrigins != null && !envAllowedOrigins.isBlank())
                     ? envAllowedOrigins
                     : (propAllowedOrigins != null && !propAllowedOrigins.isBlank()
                        ? propAllowedOrigins
                        : "http://localhost:3000,http://localhost:5173"); // safe default for dev

        return Arrays.stream(raw.split(","))
                     .map(String::trim)
                     .filter(s -> !s.isEmpty())
                     .toArray(String[]::new);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        String[] allowed = resolveOrigins();

        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(allowed)          // exact allowed origins
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
