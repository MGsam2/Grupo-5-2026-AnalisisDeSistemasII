package com.banco.auth.dto;

public class JwtDto {
    private String token;
    private String bearer = "Bearer";
    private String rol; // NUEVO: Variable para enviar el rol al frontend
    private String nombre;
    private String apellido;

    public JwtDto() {
    }

    // Constructor completo con nombre y apellido
    public JwtDto(String token, String rol, String nombre, String apellido) {
        this.token = token;
        this.rol = rol;
        this.nombre = nombre;
        this.apellido = apellido;
    }

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

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }
}