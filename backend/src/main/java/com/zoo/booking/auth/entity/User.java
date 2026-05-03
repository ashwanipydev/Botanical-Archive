package com.zoo.booking.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;

@Data
public class User {
    
    private Long id;

    private String fullName;

    private String email;

    @JsonIgnore
    private String password;

    private String mobileNumber;

    @JsonIgnore
    private String resetToken;

    @JsonIgnore
    private java.time.LocalDateTime resetTokenExpiry;

    private Boolean isActive = true;

    private Set<Role> roles = new HashSet<>();
}
