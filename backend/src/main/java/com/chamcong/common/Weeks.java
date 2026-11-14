package com.chamcong.common;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;

/** Tuần làm việc: bắt đầu thứ Hai, định danh bằng ngày thứ Hai. */
public final class Weeks {

    private Weeks() {
    }

    public static LocalDate requireMonday(LocalDate weekStart) {
        if (weekStart.getDayOfWeek() != DayOfWeek.MONDAY) {
            throw ApiException.badRequest("WEEK_START_NOT_MONDAY", "weekStart phải là ngày thứ Hai.");
        }
        return weekStart;
    }

    /** 7 ngày T2→CN. */
    public static List<LocalDate> days(LocalDate weekStart) {
        return IntStream.range(0, 7).mapToObj(weekStart::plusDays).toList();
    }

    /** 5 ngày T2→T6. */
    public static List<LocalDate> weekdays(LocalDate weekStart) {
        return days(weekStart).subList(0, 5);
    }

    /** T7 và CN. */
    public static List<LocalDate> weekend(LocalDate weekStart) {
        return days(weekStart).subList(5, 7);
    }

    public static boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }
}
