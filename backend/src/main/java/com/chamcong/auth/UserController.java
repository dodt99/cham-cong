package com.chamcong.auth;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.chamcong.common.ApiException;

/** Quản lý tài khoản — chỉ ADMIN (xem {@link SecurityConfig}). */
@RestController
@RequestMapping("/api/users")
class UserController {

    record UserDto(Long id, String username, String fullName, Role role, boolean active) {
    }

    record CreateUserRequest(@NotBlank String username, @NotBlank @Size(min = 8) String password,
            @NotBlank String fullName, @NotNull Role role) {
    }

    /** {@code password} để trống = giữ mật khẩu cũ. */
    record UpdateUserRequest(@NotBlank String fullName, @NotNull Role role, @NotNull Boolean active,
            @Size(min = 8) String password) {
    }

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;

    UserController(AppUserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    List<UserDto> list() {
        return users.findAll(Sort.by("username")).stream().map(UserController::toDto).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    UserDto create(@Valid @RequestBody CreateUserRequest body) {
        if (users.existsByUsername(body.username())) {
            throw ApiException.conflict("USERNAME_TAKEN", "Tên đăng nhập đã tồn tại.", null);
        }
        return toDto(users.save(new AppUser(body.username(), passwordEncoder.encode(body.password()),
                body.fullName(), body.role())));
    }

    @PutMapping("/{id}")
    @Transactional
    UserDto update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest body) {
        AppUser user = users.findById(id)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "Không tìm thấy người dùng."));
        boolean losesAdmin = user.getRole() == Role.ADMIN && user.isActive()
                && (body.role() != Role.ADMIN || !body.active());
        if (losesAdmin && users.countByRoleAndActiveTrue(Role.ADMIN) <= 1) {
            throw ApiException.badRequest("LAST_ADMIN", "Phải còn ít nhất một tài khoản admin đang hoạt động.");
        }
        user.setFullName(body.fullName());
        user.setRole(body.role());
        user.setActive(body.active());
        if (body.password() != null && !body.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(body.password()));
        }
        return toDto(user);
    }

    private static UserDto toDto(AppUser user) {
        return new UserDto(user.getId(), user.getUsername(), user.getFullName(), user.getRole(), user.isActive());
    }
}
