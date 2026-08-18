package com.banco.quejas.repositorio;

import com.banco.quejas.modelo.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Asegúrate de que tenga el <Producto, Long>
@Repository
public interface ProductoRepositorio extends JpaRepository<Producto, Long> {
}