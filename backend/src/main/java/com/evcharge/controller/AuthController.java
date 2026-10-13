package com.evcharge.controller;

import com.evcharge.dto.Dtos.*;
import com.evcharge.model.*;
import com.evcharge.repository.UserRepository;
import com.evcharge.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw new IllegalStateException("This email is already registered.");
        User u = new User();
        u.setName(req.name().trim());
        u.setEmail(email);
        u.setPassword(encoder.encode(req.password()));
        u.setRole(Role.USER);
        users.save(u);
        return respond(u);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User u = users.findByEmail(req.email().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!encoder.matches(req.password(), u.getPassword()))
            throw new BadCredentialsException("Invalid email or password");
        return respond(u);
    }

    private AuthResponse respond(User u) {
        return new AuthResponse(jwt.generate(u.getEmail(), u.getRole().name()),
                u.getName(), u.getEmail(), u.getRole().name());
    }
}
