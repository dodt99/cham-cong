package com.chamcong.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/** Tạo tài khoản admin đầu tiên từ cấu hình khi hệ thống chưa có người dùng nào. */
@Component
class AdminBootstrap implements ApplicationRunner {

    @ConfigurationProperties("app.bootstrap-admin")
    record Properties(String username, String password) {
    }

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final Properties properties;
    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;

    AdminBootstrap(Properties properties, AppUserRepository users, PasswordEncoder passwordEncoder) {
        this.properties = properties;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.count() > 0) {
            return;
        }
        if (!StringUtils.hasText(properties.username()) || !StringUtils.hasText(properties.password())) {
            log.warn("Chưa có người dùng nào. Đặt APP_ADMIN_USERNAME và APP_ADMIN_PASSWORD để tạo tài khoản admin đầu tiên.");
            return;
        }
        users.save(new AppUser(properties.username(), passwordEncoder.encode(properties.password()),
                "Quản trị viên", Role.ADMIN));
        log.info("Đã tạo tài khoản admin đầu tiên: {}", properties.username());
    }
}
