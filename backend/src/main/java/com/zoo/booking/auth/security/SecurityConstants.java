package com.zoo.booking.auth.security;

public final class SecurityConstants {
    private SecurityConstants() {}

    public static final String ADMIN = "ROLE_ADMIN";
    public static final String STAFF = "ROLE_STAFF";
    public static final String GATEKEEPER = "ROLE_GATEKEEPER";
    public static final String USER = "ROLE_USER";
    public static final String SLOTS = "ROLE_SLOTS";
    public static final String PRICING = "ROLE_PRICING";
    public static final String BOOKINGS = "ROLE_BOOKINGS";
    public static final String ANALYTICS = "ROLE_ANALYTICS";

    // SpEL expressions for easier reuse in @PreAuthorize
    public static final String HAS_ADMIN = "hasAuthority('" + ADMIN + "')";
    public static final String HAS_STAFF = "hasAuthority('" + STAFF + "')";
    public static final String HAS_ADMIN_OR_STAFF = "hasAuthority('" + ADMIN + "') or hasAuthority('" + STAFF + "')";
    public static final String HAS_ADMIN_OR_PRICING = "hasAuthority('" + ADMIN + "') or hasAuthority('" + PRICING + "')";
    public static final String HAS_ADMIN_OR_SLOTS = "hasAuthority('" + ADMIN + "') or hasAuthority('" + SLOTS + "')";
    public static final String HAS_ADMIN_OR_BOOKINGS = "hasAuthority('" + ADMIN + "') or hasAuthority('" + BOOKINGS + "')";
    public static final String HAS_GATEKEEPER_OR_ADMIN = "hasAuthority('" + GATEKEEPER + "') or hasAuthority('" + ADMIN + "')";
    public static final String HAS_ANY_MANAGEMENT = "hasAuthority('" + ADMIN + "') or hasAuthority('" + STAFF + "') or hasAuthority('" + PRICING + "')";
}
