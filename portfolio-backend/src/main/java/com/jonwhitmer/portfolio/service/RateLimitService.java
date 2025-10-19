package com.jonwhitmer.portfolio.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.time.Instant;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@Slf4j
public class RateLimitService {
    private final ConcurrentHashMap<String, Queue<Instant>> ipRequestMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 3;
    private static final long TIME_WINDOW_SECONDS = 1800; // 30 minutes

    public boolean isAllowed(String ipAddress) {
        Queue<Instant> requests = ipRequestMap.computeIfAbsent(ipAddress, k -> new ConcurrentLinkedQueue<>());
        Instant now = Instant.now();
        Instant cutoff = now.minusSeconds(TIME_WINDOW_SECONDS);
        
        // Remove old requests outside the 30-minute window
        requests.removeIf(timestamp -> timestamp.isBefore(cutoff));
        
        // Check if this IP is under the limit
        if (requests.size() < MAX_REQUESTS) {
            requests.add(now);
            log.info("Rate limit check passed for IP: {} ({}/{})", ipAddress, requests.size(), MAX_REQUESTS);
            return true;
        }
        
        log.warn("Rate limit exceeded for IP: {}", ipAddress);
        return false;
    }
    
    public long getSecondsUntilReset(String ipAddress) {
        Queue<Instant> requests = ipRequestMap.get(ipAddress);
        if (requests == null || requests.isEmpty()) {
            return 0;
        }
        
        Instant oldest = requests.peek();
        if (oldest == null) {
            return 0;
        }
        
        Instant resetTime = oldest.plusSeconds(TIME_WINDOW_SECONDS);
        long secondsUntilReset = resetTime.getEpochSecond() - Instant.now().getEpochSecond();
        return Math.max(0, secondsUntilReset);
    }
}