package com.banco.quejas.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "catalogo_estados")
public class EstadoQueja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ej: "Registrada", "EnValidacion", "Aprobada"
    @Column(unique = true, nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String descripcion;

    public EstadoQueja() {}

    public EstadoQueja(String nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}