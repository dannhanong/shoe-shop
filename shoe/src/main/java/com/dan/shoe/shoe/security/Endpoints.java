package com.dan.shoe.shoe.security;

public class Endpoints {
    public static final String[] PUBLIC_POST_ENDPOINTS = {
            "/auth/login",
            "/auth/signup",
            "/auth/forgot-password"
    };

    public static final String[] PRIVATE_POST_ENDPOINTS = {
            "/auth/logout",
            "/orders/**",
            "/cart/**",
            "/addresses/**",
            "/colors/create",
    };

    public static final String[] ADMIN_POST_ENDPOINTS = {
            "/categories/admin/create",
            "/foods/admin/create",
            "/tables/admin/create",
            "/catalogs/admin/**",
            "/auth/admin/**",
            "/accounts/admin/**",
            "/discounts/admin/**",
    };

    public static final String[] STAFF_POST_ENDPOINTS = {
            "/products/staff/**",
            "/histories/**",
    };

    public static final String[] PUBLIC_GET_ENDPOINTS = {
            "/auth/**",
            "/categories/all",
            "/products/public/**",
            "/orders/**",
            "/files/**",
            "/products/**",
            "/brands/all",
            "/discounts/public/**",
            "/payment",
            "/colors/**"
    };

    public static final String[] PRIVATE_GET_ENDPOINTS = {
            "/auth/get/profile",
            "/cart/**",
            "/addresses/**",
            "/orders/info/**",
    };

    public static final String[] PUBLIC_PUT_ENDPOINTS = {
            "/auth/reset-password",
            "/auth/update-verify-code",
            "/tables/update-status/**",
            "/orders/public/**",
    };

    public static final String[] PRIVATE_PUT_ENDPOINTS = {
            "/auth/change-password",
            "/auth/update-profile",
            "/cart/**",
            "/addresses/**",
    };

    public static final String[] ADMIN_PUT_ENDPOINTS = {
            "/brands/admin/**",
            "/categories/admin/**",
            "/accounts/admin/**",
            "/staffs/admin/**",
            "/discounts/admin/**",
    };

    public static final String[] STAFF_GET_ENDPOINTS = {
        "/accounts/admin/**",
        "/histories/**",
    };

    public static final String[] STAFF_PUT_ENDPOINTS = {
            "/products/staff/update/**",
            "/staffs/admin/**",
            "/orders/staff/**",
    };

    public static final String[] PRIVATE_DELETE_ENDPOINTS = {
            "/auth/delete/hard",
            "/cart/**",
            "/addresses/**",
    };

    public static final String[] ADMIN_DELETE_ENDPOINTS = {
            "/categories/admin/delete/**",
            "/brands/admin/delete/**",
            "/staffs/admin/**",
            "/discounts/admin/**",
    };

    public static final String[] ADMIN_GET_ENDPOINTS = {
            "/brands/admin/**",
            "/categories/admin/**",
            "/staffs/admin/**"
    };
}
