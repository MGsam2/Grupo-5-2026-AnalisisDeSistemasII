package com.banco.quejas.repositorio;

import com.banco.quejas.modelo.Documento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoRepositorio extends JpaRepository<Documento, Long> {
    List<Documento> findByQuejaId(Long quejaId);
}