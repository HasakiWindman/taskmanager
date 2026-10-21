package com.sunny.taskmanager;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://taskmanager-puce-pi.vercel.app"
})
@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User request) {
        if (request.getEmail() == null || request.getEmail().isBlank()
            || request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body("Provide an email and a password of at least 6 characters");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body("Invalid email");
        }
        if (users.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }
        User user = new User(email, encoder.encode(request.getPassword()));
        users.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
        User user = users.findByEmail(request.getEmail().trim().toLowerCase()).orElse(null);
        if (user == null || !encoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
        return ResponseEntity.ok(jwt.generateToken(user));
    }
}
