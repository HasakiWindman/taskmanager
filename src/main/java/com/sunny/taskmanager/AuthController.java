package com.sunny.taskmanager;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://taskmanager-puce-pi.vercel.app"
})
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "Email already exists";
        }
        String hashedPassword =
                passwordEncoder.encode(user.getPassword());

        user.setPassword(hashedPassword);

        userRepository.save(user);

        return "User registered";
    }

    @PostMapping("/login")
public String login(@RequestBody User user) {

    User savedUser = userRepository
            .findByEmail(user.getEmail())
            .orElse(null);

    if (savedUser == null) {
        return "User not found";
    }

    if (!passwordEncoder.matches(user.getPassword(), savedUser.getPassword())) {

        return "Wrong password";
        
    }
    return jwtService.generateToken(savedUser);
}
}