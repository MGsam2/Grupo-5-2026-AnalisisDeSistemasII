package com.banco.quejas.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "catalogo_productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ej: "Cuentas de ahorro", "Tarjetas de crédito", etc.
    @Column(unique = true, nullable = false)
    private String nombre;

    // Buena práctica para catálogos: permitir desactivar productos antiguos sin borrarlos
    @Column(nullable = false)
    private Boolean activo = true;

    public Producto() {}

    public Producto(String nombre) {
        this.nombre = nombre;
        this.activo = true;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}