package com.banco.quejas.repositorio;

import com.banco.quejas.modelo.Queja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuejaRepositorio extends JpaRepository<Queja, Long> {
    
    // Para listar todas las quejas de un cliente en su dashboard
    List<Queja> findByUsuarioEmail(String usuarioEmail);
    
    // NUEVO: Para buscar una queja exacta por su código de ticket (ej. QJ-1234)
    Queja findByNumeroTicket(String numeroTicket);
}