package com.chamcong.export;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/** Định dạng ngày giờ dùng trong tiêu đề file và bảng xem trước. */
final class Formats {

    private static final DateTimeFormatter DD_MM_YYYY = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DD_M_YYYY = DateTimeFormatter.ofPattern("dd/M/yyyy");
    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private Formats() {
    }

    /** 04/05/2026 */
    static String date(LocalDate date) {
        return DD_MM_YYYY.format(date);
    }

    /** 09/5/2026 — ngày 2 chữ số, tháng không đệm 0. */
    static String dateShortMonth(LocalDate date) {
        return DD_M_YYYY.format(date);
    }

    static String time(LocalTime time) {
        return time == null ? "" : HH_MM.format(time);
    }

    static String orEmpty(String value) {
        return value == null ? "" : value;
    }
}
