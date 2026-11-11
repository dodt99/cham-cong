package com.chamcong.common;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiExceptionHandler {

    public record ErrorBody(String code, String message, Object details) {
    }

    @ExceptionHandler(ApiException.class)
    ResponseEntity<ErrorBody> handleApi(ApiException ex) {
        return ResponseEntity.status(ex.status()).body(new ErrorBody(ex.code(), ex.getMessage(), ex.details()));
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ErrorBody> handleAuthentication(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorBody("INVALID_CREDENTIALS", "Sai tên đăng nhập hoặc mật khẩu.", null));
    }

    /** Trùng khoá duy nhất hoặc vi phạm ràng buộc mà tầng nghiệp vụ chưa bắt trước. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ErrorBody> handleDataIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorBody("DATA_CONFLICT", "Dữ liệu trùng hoặc đang được dùng ở nơi khác.", null));
    }

    @ExceptionHandler({
            MethodArgumentNotValidException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            HttpMessageNotReadableException.class
    })
    ResponseEntity<ErrorBody> handleInvalidRequest(Exception ex) {
        return ResponseEntity.badRequest().body(new ErrorBody("INVALID_REQUEST", "Yêu cầu không hợp lệ.", null));
    }
}
