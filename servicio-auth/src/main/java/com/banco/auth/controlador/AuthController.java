package com.banco.auth.controlador;

import com.banco.auth.dto.JwtDto;
import com.banco.auth.dto.LoginUsuario;
import com.banco.auth.modelo.Bitacora;
import com.banco.auth.modelo.Usuario;
import com.banco.auth.repositorio.BitacoraRepositorio;
import com.banco.auth.repositorio.UsuarioRepositorio;
import com.banco.auth.seguridad.JwtProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Permite peticiones desde el frontend en desarrollo
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private BitacoraRepositorio bitacoraRepositorio;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginUsuario loginUsuario) {

        // 1. Validar si el usuario existe y si está inactivo (Flujo Alterno FA05)
        Optional<Usuario> usuarioOpt = usuarioRepositorio.findByEmail(loginUsuario.getEmail());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (!usuario.isActivo()) {
                // El sistema detecta que el usuario está deshabilitado y devuelve el error 403
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        Map.of(
                                "error", "CUENTA_INACTIVA",
                                "mensaje", "Su cuenta se encuentra inactiva."));
            }
        }

        // 2. Autenticamos al usuario (Valida que la contraseña sea correcta)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginUsuario.getEmail(), loginUsuario.getPassword()));

        // Colocamos la autenticación en el contexto de seguridad
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Generamos el token JWT
        String jwt = jwtProvider.generarToken(authentication);

        // 4. El sistema identifica el rol del usuario
        String rolPrincipal = authentication.getAuthorities().iterator().next().getAuthority();

        // 5. El sistema registra el evento en la bitácora de auditoría (Usuario,
        // Fecha/Hora, Rol)
        try {
            Bitacora registro = new Bitacora(
                    loginUsuario.getEmail(),
                    LocalDateTime.now(),
                    rolPrincipal,
                    "LOGIN_EXITOSO");
            bitacoraRepositorio.save(registro);
        } catch (Exception e) {
            System.err.println("Advertencia: No se pudo registrar en la bitácora: " + e.getMessage());
        }

        // 6. Instanciamos el DTO pasándole el token y el rol
        JwtDto jwtDto = new JwtDto(jwt, rolPrincipal);

        // 7. Devolvemos el DTO completo al Frontend
        return new ResponseEntity<>(jwtDto, HttpStatus.OK);
    }

    // Endpoint del Flujo Alterno FA05: Solicitud de activación de usuario
    @PostMapping("/solicitar-activacion")
    public ResponseEntity<?> solicitarActivacion(@RequestBody Map<String, String> request) {
        String email = request.get("usuario");
        String motivo = request.get("motivo");

        // El sistema recibe la solicitud y simula el envío al administrador
        System.out.println("🚨 NUEVA SOLICITUD DE ACTIVACIÓN RECIBIDA 🚨");
        System.out.println("Usuario: " + email);
        System.out.println("Motivo: " + motivo);
        System.out.println("Enviando correo de solicitud al administrador...");

        return ResponseEntity.ok(
                Map.of("mensaje", "Solicitud de activación enviada al administrador con éxito."));
    }
}