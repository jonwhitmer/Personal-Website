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

    // Replace the previous property/ENV handling with the new frontend.origin property
    @Value("${frontend.origin:http://localhost:5173}") // fallback for dev
    private String frontendOrigin;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        String[] allowed = Arrays.stream(frontendOrigin.split(","))
                            .map(String::trim)
                            .toArray(String[]::new);

        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(allowed)
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
