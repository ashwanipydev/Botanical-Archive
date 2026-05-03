package com.zoo.booking.auth.service;

import com.zoo.booking.auth.entity.ERole;
import com.zoo.booking.auth.entity.Role;
import com.zoo.booking.auth.entity.User;
import com.zoo.booking.auth.repository.RoleRepository;
import com.zoo.booking.auth.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class StaffService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;

    public StaffService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
    }

    public List<User> getAllStaff() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream()
                        .anyMatch(r -> r.getName() != ERole.ROLE_USER))
                .collect(Collectors.toList());
    }

    @Transactional
    public User createStaff(User user, Set<ERole> roleNames) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Set default password if not provided
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPassword(encoder.encode("staff123")); // Default password
        } else {
            user.setPassword(encoder.encode(user.getPassword()));
        }

        Set<Role> roles = new HashSet<>();
        roles.add(roleRepository.findByName(ERole.ROLE_USER).get());
        for (ERole roleName : roleNames) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Error: Role " + roleName + " is not found."));
            roles.add(role);
        }

        user.setRoles(roles);
        return userRepository.save(user);
    }

    @Transactional
    public User updateStaff(Long userId, User userDetails, Set<ERole> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(userDetails.getFullName());
        user.setEmail(userDetails.getEmail());
        if (userDetails.getMobileNumber() != null) {
            user.setMobileNumber(userDetails.getMobileNumber());
        }
        
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(encoder.encode(userDetails.getPassword()));
        }

        Set<Role> roles = new HashSet<>();
        roles.add(roleRepository.findByName(ERole.ROLE_USER).get());
        for (ERole roleName : roleNames) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Error: Role " + roleName + " is not found."));
            roles.add(role);
        }
        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Transactional
    public void deleteStaff(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    @Transactional
    public User toggleStaffStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        return userRepository.save(user);
    }
}
