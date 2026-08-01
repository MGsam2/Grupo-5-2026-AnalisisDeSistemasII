package com.banco.auth.dto;

public class JwtDto {
    private String token;
    private String bearer = "Bearer";

    public JwtDto(String token) {
        this.token = token;
    }

    // Getters y Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getBearer() { return bearer; }
    public void setBearer(String bearer) { this.bearer = bearer; }
}