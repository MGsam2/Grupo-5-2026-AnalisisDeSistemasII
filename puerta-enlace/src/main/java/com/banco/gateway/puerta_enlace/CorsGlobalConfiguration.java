package com.banco.gateway.puerta_enlace;


import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsGlobalConfiguration implements WebFilter {

    @Override
    public Mono filter(ServerWebExchange exchange, WebFilterChain chain) {
        // Forzamos las cabeceras en todas y cada una de las respuestas
        exchange.getResponse().getHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponse().getHeaders().set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        exchange.getResponse().getHeaders().set("Access-Control-Allow-Headers", "*");
        exchange.getResponse().getHeaders().set("Access-Control-Expose-Headers", "Authorization");

        // Si es la petición "preflight" de seguridad del navegador, respondemos OK de inmediato y cortamos el viaje
        if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
            exchange.getResponse().setStatusCode(HttpStatus.OK);
            return Mono.empty();
        }

        return chain.filter(exchange);
    }
}