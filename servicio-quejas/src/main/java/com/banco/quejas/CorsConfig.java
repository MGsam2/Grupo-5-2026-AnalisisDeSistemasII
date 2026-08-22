package com.banco.quejas;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitir credenciales (Token JWT)
        config.setAllowCredentials(true);
        
        // Permitir explícitamente cualquier origen
        config.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // Permitir todos los headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Permitir todos los métodos HTTP
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicar esta regla a absolutamente todos los endpoints
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}