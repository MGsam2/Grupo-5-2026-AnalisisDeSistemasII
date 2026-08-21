package com.banco.quejas; 

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ServicioQuejasApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServicioQuejasApplication.class, args);
    }

}