package com.chamcong.auth;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Đối chiếu phiên đang mở với bảng {@code app_user} ở mỗi request, để việc khoá tài khoản hoặc đổi quyền
 * có hiệu lực ngay thay vì chờ người đó đăng xuất: tài khoản bị khoá / đã xoá thì phiên bị huỷ (request
 * nhận 401), quyền đã đổi thì phiên nhận quyền mới.
 */
class AccountStateFilter extends OncePerRequestFilter {

    private final UserDetailsService userDetailsService;
    private final SecurityContextRepository contextRepository;

    AccountStateFilter(UserDetailsService userDetailsService, SecurityContextRepository contextRepository) {
        this.userDetailsService = userDetailsService;
        this.contextRepository = contextRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication current = SecurityContextHolder.getContext().getAuthentication();
        if (current != null && current.isAuthenticated() && !(current instanceof AnonymousAuthenticationToken)) {
            UserDetails account = load(current.getName());
            if (account == null || !account.isEnabled()) {
                endSession(request);
            } else if (!sameAuthorities(current, account)) {
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(
                        UsernamePasswordAuthenticationToken.authenticated(account, null, account.getAuthorities()));
                SecurityContextHolder.setContext(context);
                contextRepository.saveContext(context, request, response);
            }
        }
        chain.doFilter(request, response);
    }

    private UserDetails load(String username) {
        try {
            return userDetailsService.loadUserByUsername(username);
        } catch (UsernameNotFoundException e) {
            return null;
        }
    }

    private static void endSession(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    private static boolean sameAuthorities(Authentication current, UserDetails account) {
        return names(current.getAuthorities()).equals(names(account.getAuthorities()));
    }

    private static Set<String> names(Iterable<? extends GrantedAuthority> authorities) {
        Set<String> names = new HashSet<>();
        authorities.forEach(authority -> names.add(authority.getAuthority()));
        return names;
    }
}
