package com.banco.auth.util;

import com.banco.auth.modelo.Rol;
import com.banco.auth.modelo.RolNombre;
import com.banco.auth.modelo.Usuario;
import com.banco.auth.repositorio.RolRepositorio;
import com.banco.auth.repositorio.UsuarioRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RolRepositorio rolRepositorio;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Solo inserta si no existen roles
        if (rolRepositorio.count() == 0) {
            rolRepositorio.save(new Rol(RolNombre.ROLE_USUARIO_FINAL, "Cliente que interpone la queja"));
            rolRepositorio.save(new Rol(RolNombre.ROLE_AGENTE_BANCARIO, "Agente que revisa y propone solución"));
            rolRepositorio.save(new Rol(RolNombre.ROLE_SUPERVISOR, "Supervisor que aprueba la propuesta"));
            rolRepositorio.save(new Rol(RolNombre.ROLE_JEFE_FINAL, "Emite el dictamen final"));
            rolRepositorio.save(new Rol(RolNombre.ROLE_ADMIN, "Administrador del sistema"));
        }

        // Crea un usuario administrador por defecto si no existe
        if (!usuarioRepositorio.existsByEmail("elgarciam4@gmail.com")) {
            Usuario admin = new Usuario();
            admin.setNombre("Admin");
            admin.setApellido("Sistema");
            admin.setEmail("elgarciam4@gmail.com");
            // Encriptamos la contraseña "Admin123$" usando BCrypt
            admin.setPassword(passwordEncoder.encode("Admin123$")); 
            
            Rol rolAdmin = rolRepositorio.findByNombre(RolNombre.ROLE_ADMIN).get();
            admin.getRoles().add(rolAdmin);
            
            usuarioRepositorio.save(admin);
            System.out.println("✅ Usuario Admin creado: admin@banco.com / Admin123$");
        }
    }
}