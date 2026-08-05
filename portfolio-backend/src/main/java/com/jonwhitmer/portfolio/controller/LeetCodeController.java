package com.jonwhitmer.portfolio.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/leetcode")
public class LeetCodeController {

    @Autowired
    private WebClient.Builder webClientBuilder;

    @GetMapping("/{username}")
    public Mono<Map<String, Object>> getLeetCodeStats(@PathVariable String username) {
        String query = """
            query getUserData($username: String!) {
              matchedUser(username: $username) {
                submitStats {
                  acSubmissionNum {
                    difficulty
                    count
                  }
                }
                recentSubmissionList(limit: 10) {
                  title
                  titleSlug
                  statusDisplay
                  lang
                  timestamp
                }
              }
            }
            """;

        Map<String, Object> requestBody = Map.of(
            "query", query,
            "variables", Map.of("username", username)
        );

        return webClientBuilder.build()
            .post()
            .uri("https://leetcode.com/graphql")
            .header("Content-Type", "application/json")
            .header("Referer", "https://leetcode.com")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(Map.class)
            .map(response -> {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                if (data == null || data.get("matchedUser") == null) {
                    throw new RuntimeException("User not found");
                }
                Map<String, Object> matchedUser = (Map<String, Object>) data.get("matchedUser");
                Map<String, Object> submitStats = (Map<String, Object>) matchedUser.get("submitStats");
                
                return Map.of(
                    "stats", submitStats.get("acSubmissionNum"),
                    "recent", matchedUser.get("recentSubmissionList")
                );
            });
    }
}