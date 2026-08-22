package com.banco.quejas.repositorio;

import com.banco.quejas.modelo.BitacoraQueja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BitacoraQuejaRepositorio extends JpaRepository<BitacoraQueja, Long> {
}