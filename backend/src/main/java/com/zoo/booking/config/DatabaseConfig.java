package com.zoo.booking.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.jdbc.DataSourceBuilder;
import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @org.springframework.beans.factory.annotation.Value("${spring.datasource.url}")
    private String defaultUrl;
    @org.springframework.beans.factory.annotation.Value("${spring.datasource.username}")
    private String defaultUsername;
    @org.springframework.beans.factory.annotation.Value("${spring.datasource.password}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() throws URISyntaxException {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            logger.info("DATABASE_URL not found, using configuration from application.properties");
            return DataSourceBuilder.create()
                    .url(defaultUrl)
                    .username(defaultUsername)
                    .password(defaultPassword)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        }



        logger.info("DATABASE_URL found, attempting to parse for JDBC connection");
        try {
            // Handle both postgres:// and postgresql:// formats
            String cleanUrl = databaseUrl.replace("postgresql://", "postgres://");
            URI dbUri = new URI(cleanUrl);
            
            String userInfo = dbUri.getUserInfo();
            String username = userInfo.split(":")[0];
            String password = userInfo.split(":")[1];
            
            String host = dbUri.getHost();
            int port = dbUri.getPort();
            String dbName = dbUri.getPath();

            String jdbcUrl = String.format("jdbc:postgresql://%s:%d%s", host, port, dbName);
            logger.info("JDBC Connection established for host: {}", host);

            return DataSourceBuilder.create()
                    .url(jdbcUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        } catch (Exception e) {
            logger.error("Failed to parse DATABASE_URL: {}", databaseUrl, e);
            throw new RuntimeException("Could not configure database connection", e);
        }
    }
}
