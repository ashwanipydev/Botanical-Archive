package com.zoo.booking.auth.controller;
import com.zoo.booking.system.service.EmailService;

import com.zoo.booking.auth.entity.ERole;
import com.zoo.booking.auth.entity.Role;
import com.zoo.booking.auth.entity.User;
import com.zoo.booking.auth.payload.request.LoginRequest;
import com.zoo.booking.auth.payload.request.SignupRequest;
import com.zoo.booking.auth.payload.response.JwtResponse;
import com.zoo.booking.auth.payload.response.MessageResponse;
import com.zoo.booking.auth.repository.RoleRepository;
import com.zoo.booking.auth.repository.UserRepository;
import com.zoo.booking.auth.security.jwt.JwtUtils;
import com.zoo.booking.auth.security.services.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and registration endpoints")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    com.zoo.booking.system.service.EmailService emailService;

    @PostMapping("/signin")
    @Operation(summary = "User Login", description = "Authenticate user with email and password")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful, returns JWT token"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new JwtResponse(jwt,
                                                     userDetails.getId(),
                                                     userDetails.getEmail(),
                                                     roles));
        } catch (org.springframework.security.core.AuthenticationException e) {
            System.err.println("❌ Authentication failed for email: " + loginRequest.getEmail());
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error: Invalid email or password. Please check your credentials and try again."));
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during login: " + e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error: An unexpected error occurred during login. Please try again later."));
        }
    }

    @PostMapping("/signup")
    @Operation(summary = "User Registration", description = "Register a new user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User registered successfully"),
        @ApiResponse(responseCode = "400", description = "Email already in use or invalid input")
    })
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setFullName(signUpRequest.getFullName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setMobileNumber(signUpRequest.getMobileNumber());

        Set<Role> roles = new HashSet<>();
        // Production safety: never accept roles from a public signup request.
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot Password", description = "Request a password reset token")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        java.util.Optional<User> userOptional = userRepository.findByEmail(email);
        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email not found!"));
        }

        User user = userOptional.get();
        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        emailService.sendResetPasswordEmail(email, token);

        return ResponseEntity.ok(new MessageResponse("Password reset link sent to your email."));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset Password", description = "Reset password using token")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        java.util.Optional<User> userOptional = userRepository.findByResetToken(token);
        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired token!"));
        }

        User user = userOptional.get();
        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Token has expired!"));
        }

        user.setPassword(encoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password reset successful!"));
    }
}
