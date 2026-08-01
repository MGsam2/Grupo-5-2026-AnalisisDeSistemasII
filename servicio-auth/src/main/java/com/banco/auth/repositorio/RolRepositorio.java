package com.banco.auth.repositorio;

import com.banco.auth.modelo.Rol;
import com.banco.auth.modelo.RolNombre;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RolRepositorio extends JpaRepository<Rol, Integer> {
    Optional<Rol> findByNombre(RolNombre nombre);
}