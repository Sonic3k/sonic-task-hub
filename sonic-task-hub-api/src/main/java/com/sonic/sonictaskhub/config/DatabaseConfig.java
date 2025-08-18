package com.sonic.sonictaskhub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.io.File;

@Configuration
@EnableJpaRepositories(basePackages = "com.sonic.sonictaskhub.repository")
@EnableTransactionManagement
public class DatabaseConfig {

    /**
     * DataSource configuration for SQLite
     */
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource dataSource() {
        // Ensure data directory exists
        File dataDir = new File("data");
        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }
        
        return DataSourceBuilder
                .create()
                .driverClassName("org.sqlite.JDBC")
                .url("jdbc:sqlite:data/sonictaskhub.db")
                .build();
    }
}