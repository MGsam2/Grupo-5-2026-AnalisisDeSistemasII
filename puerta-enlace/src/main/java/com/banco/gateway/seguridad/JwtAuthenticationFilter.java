package com.banco.gateway.seguridad;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String secret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // 1. Si es la ruta de login o registro, la dejamos pasar sin pedir token
       // 1. Si es login/registro o una peticion de validacion CORS (OPTIONS), la dejamos pasar
    if (path.contains("/api/auth") || exchange.getRequest().getMethod().name().equals("OPTIONS")) {
        return chain.filter(exchange);
    }

        // 2. Para cualquier otra ruta, exigimos el header "Authorization"
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED); // 401
            return exchange.getResponse().setComplete();
        }

        // 3. Extraemos el token quitando la palabra "Bearer "
        String token = authHeader.substring(7);

        try {
            // 4. Validamos el token y extraemos los datos (Claims)
            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
            var claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            
            // Extraemos el correo que guardamos cuando el usuario hizo login
            String emailUsuario = claims.getSubject();

            // 5. Clonamos la petición original y le inyectamos el Header seguro
            ServerWebExchange mutatedExchange = exchange.mutate().request(
                exchange.getRequest().mutate()
                    .header("X-User-Email", emailUsuario)
                    .build()
            ).build();
            
            // Continuamos el viaje, pero ahora con el Header inyectado y protegido
            return chain.filter(mutatedExchange);
            
        } catch (Exception e) {
            // Si el token fue modificado, expiró o es inventado, rechazamos la petición
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1; // Asegura que este filtro se ejecute ANTES de enrutar la petición
    }
}