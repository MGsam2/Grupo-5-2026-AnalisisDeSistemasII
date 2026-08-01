package com.banco.quejas.repositorio;

import com.banco.quejas.modelo.Queja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuejaRepositorio extends JpaRepository<Queja, Long> {
    List<Queja> findByUsuarioEmail(String usuarioEmail);
}