package com.banco.auth.repositorio;

import com.banco.auth.modelo.Bitacora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BitacoraRepositorio extends JpaRepository < Bitacora , Long > {

}