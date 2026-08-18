package com.banco.quejas.repositorio;

import com.banco.quejas.modelo.EstadoQueja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Asegúrate de que tenga el <EstadoQueja, Long>
@Repository
public interface EstadoQuejaRepositorio extends JpaRepository<EstadoQueja, Long> {
    EstadoQueja findByNombre(String nombre);
}