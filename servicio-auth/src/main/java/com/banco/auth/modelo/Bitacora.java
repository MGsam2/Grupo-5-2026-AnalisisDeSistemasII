package com.banco.auth.modelo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bitacora_auditoria")
public class Bitacora {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String usuario;
    
    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;
    
    private String rol;
    
    private String accion; // Ej: "LOGIN_EXITOSO"

    // Constructores, Getters y Setters
    public Bitacora() {}
    public Bitacora(String usuario, LocalDateTime fechaHora, String rol, String accion) {
        this.usuario = usuario;
        this.fechaHora = fechaHora;
        this.rol = rol;
        this.accion = accion;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }
}