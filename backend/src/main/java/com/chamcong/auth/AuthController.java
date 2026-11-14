package com.chamcong.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
class AuthController {

    record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    record CurrentUser(Long id, String username, String fullName, Role role) {
    }

    record CsrfResponse(String headerName, String token) {
    }

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository;
    private final CurrentUserProvider currentUser;

    AuthController(AuthenticationManager authenticationManager, SecurityContextRepository contextRepository,
            CurrentUserProvider currentUser) {
        this.authenticationManager = authenticationManager;
        this.contextRepository = contextRepository;
        this.currentUser = currentUser;
    }

    /** Client gọi trước lần POST đầu tiên để nhận cookie XSRF-TOKEN. */
    @GetMapping("/csrf")
    CsrfResponse csrf(CsrfToken token) {
        return new CsrfResponse(token.getHeaderName(), token.getToken());
    }

    @PostMapping("/login")
    CurrentUser login(@Valid @RequestBody LoginRequest body, HttpServletRequest request,
            HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(body.username(), body.password()));
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);
        return toDto(currentUser.require());
    }

    @GetMapping("/me")
    CurrentUser me() {
        return toDto(currentUser.require());
    }

    private static CurrentUser toDto(AppUser user) {
        return new CurrentUser(user.getId(), user.getUsername(), user.getFullName(), user.getRole());
    }
}
