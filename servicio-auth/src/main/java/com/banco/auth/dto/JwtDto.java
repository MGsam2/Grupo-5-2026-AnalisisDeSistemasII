package com.banco.auth.dto;

public class JwtDto {
    private String token;
    private String bearer = "Bearer";
    private String rol; // NUEVO: Variable para enviar el rol al frontend

    // Constructor actualizado
    public JwtDto(String token, String rol) {
        this.token = token;
        this.rol = rol;
    }

    // Getters y Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getBearer() {
        return bearer;
    }

    public void setBearer(String bearer) {
        this.bearer = bearer;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}