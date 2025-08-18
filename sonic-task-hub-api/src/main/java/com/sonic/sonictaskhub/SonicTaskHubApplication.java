package com.sonic.sonictaskhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main application class for Sonic Task Hub
 * 
 * A comprehensive productivity system that serves as a central hub
 * for managing tasks, habits, reminders, and life decisions.
 */
@SpringBootApplication
@EnableJpaAuditing
public class SonicTaskHubApplication {

    public static void main(String[] args) {
        System.out.println("🎵 Starting Sonic Task Hub API...");
        SpringApplication.run(SonicTaskHubApplication.class, args);
        System.out.println("🚀 Sonic Task Hub API is ready!");
        System.out.println("📊 Access the API at: http://localhost:8080/api");
    }
}