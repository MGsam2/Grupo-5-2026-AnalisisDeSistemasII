package com.banco.gateway.puerta_enlace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.banco.gateway")
public class PuertaEnlaceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PuertaEnlaceApplication.class, args);
    }
}