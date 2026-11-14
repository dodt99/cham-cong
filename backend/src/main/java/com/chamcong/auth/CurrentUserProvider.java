package com.chamcong.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.chamcong.common.ApiException;

/** Người dùng của request hiện tại. */
@Component
public class CurrentUserProvider {

    private final AppUserRepository users;

    CurrentUserProvider(AppUserRepository users) {
        this.users = users;
    }

    public AppUser require() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw unauthenticated();
        }
        return users.findByUsername(authentication.getName()).orElseThrow(CurrentUserProvider::unauthenticated);
    }

    public Long requireId() {
        return require().getId();
    }

    private static ApiException unauthenticated() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Chưa đăng nhập.");
    }
}
