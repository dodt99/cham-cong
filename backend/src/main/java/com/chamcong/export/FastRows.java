package com.chamcong.export;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;

import com.chamcong.catalog.Catalog.LocationInfo;
import com.chamcong.catalog.Catalog.OffTypeInfo;
import com.chamcong.catalog.Catalog.ShiftInfo;
import com.chamcong.common.Weeks;
import com.chamcong.export.WeekSchedule.EveningEntry;
import com.chamcong.export.WeekSchedule.MainEntry;
import com.chamcong.export.WeekSchedule.MemberWeek;

/**
 * Dựng dòng cho file Fast "Đăng ký công việc" (spec mục 7.1).
 *
 * <p>T2→T6: ba loại đoạn (làm việc / nghỉ / ca tối), mỗi loại gộp các ngày liên tiếp giống nhau.
 * T7, CN: không gộp, mỗi ngày một dòng. Trong một nhân viên: xếp theo ngày bắt đầu rồi theo loại.
 */
public final class FastRows {

    public static final String OFF_LABEL = "Nghỉ";
    public static final String HALF_DAY_NOTE = "Nghỉ chiều";

    private FastRows() {
    }

    public enum Kind { WORK, OFF, EVENING }

    public record FastRow(String employeeCode, String fullName, LocalDate fromDate, LocalDate toDate, Kind kind,
            String shiftLabel, String locationCode, String note) {

        /** Dòng chỉ gồm đúng một ngày T7 hoặc CN — ô ngày được tô nền trên file. */
        public boolean isSingleWeekendDay() {
            return fromDate.equals(toDate) && Weeks.isWeekend(fromDate);
        }
    }

    public static List<FastRow> build(WeekSchedule schedule) {
        List<FastRow> rows = new ArrayList<>();
        for (MemberWeek member : schedule.coreMembers()) {
            rows.addAll(rowsOf(member, schedule));
        }
        return rows;
    }

    private static List<FastRow> rowsOf(MemberWeek member, WeekSchedule schedule) {
        List<LocalDate> weekdays = Weeks.weekdays(schedule.weekStart());
        List<FastRow> rows = new ArrayList<>();

        // Làm việc: gộp khi cùng ca (theo id, nên "2K43" cả ngày và "2K43" nghỉ chiều không gộp) và cùng địa điểm.
        rows.addAll(runs(weekdays,
                date -> {
                    MainEntry entry = member.main().get(date);
                    return entry == null || entry.shift() == null ? null : new WorkKey(entry.shift(), entry.location());
                },
                (key, from, to) -> work(member, from, to, key.shift(), key.location())));

        // Nghỉ: ngày chưa xếp coi như loại nghỉ mặc định; gộp khi cùng loại nghỉ.
        rows.addAll(runs(weekdays,
                date -> {
                    MainEntry entry = member.main().get(date);
                    if (entry != null && entry.shift() != null) {
                        return null;
                    }
                    return entry == null ? schedule.defaultOffType() : entry.offType();
                },
                (offType, from, to) -> off(member, from, to, offType.fastNote())));

        // Ca tối: gộp khi cùng ca và cùng địa điểm.
        rows.addAll(runs(weekdays,
                date -> {
                    EveningEntry entry = member.evening().get(date);
                    return entry == null ? null : new WorkKey(entry.shift(), entry.location());
                },
                (key, from, to) -> evening(member, from, to, key.shift(), key.location())));

        // T7, CN: mỗi ngày một dòng; loại nghỉ cuối tuần không ghi chú.
        for (LocalDate date : Weeks.weekend(schedule.weekStart())) {
            MainEntry entry = member.main().get(date);
            rows.add(entry != null && entry.shift() != null
                    ? work(member, date, date, entry.shift(), entry.location())
                    : off(member, date, date, null));
            EveningEntry eveningEntry = member.evening().get(date);
            if (eveningEntry != null) {
                rows.add(evening(member, date, date, eveningEntry.shift(), eveningEntry.location()));
            }
        }

        rows.sort(Comparator.comparing(FastRow::fromDate).thenComparing(FastRow::kind));
        return rows;
    }

    private record WorkKey(ShiftInfo shift, LocationInfo location) {
    }

    private interface RunFactory<K> {
        FastRow create(K key, LocalDate from, LocalDate to);
    }

    /** Cắt dãy ngày liên tiếp thành các đoạn có cùng khoá; ngày có khoá {@code null} ngắt đoạn. */
    private static <K> List<FastRow> runs(List<LocalDate> days, Function<LocalDate, K> keyOf, RunFactory<K> factory) {
        List<FastRow> rows = new ArrayList<>();
        K current = null;
        LocalDate from = null;
        LocalDate to = null;
        for (LocalDate day : days) {
            K key = keyOf.apply(day);
            if (key != null && Objects.equals(key, current)) {
                to = day;
                continue;
            }
            if (current != null) {
                rows.add(factory.create(current, from, to));
            }
            current = key;
            from = day;
            to = day;
        }
        if (current != null) {
            rows.add(factory.create(current, from, to));
        }
        return rows;
    }

    private static FastRow work(MemberWeek member, LocalDate from, LocalDate to, ShiftInfo shift,
            LocationInfo location) {
        return new FastRow(member.member().code(), member.member().fullName(), from, to, Kind.WORK, shift.code(),
                location == null ? null : location.code(), shift.halfDay() ? HALF_DAY_NOTE : null);
    }

    private static FastRow off(MemberWeek member, LocalDate from, LocalDate to, String note) {
        return new FastRow(member.member().code(), member.member().fullName(), from, to, Kind.OFF, OFF_LABEL, null,
                note);
    }

    private static FastRow evening(MemberWeek member, LocalDate from, LocalDate to, ShiftInfo shift,
            LocationInfo location) {
        return new FastRow(member.member().code(), member.member().fullName(), from, to, Kind.EVENING, shift.code(),
                location == null ? null : location.code(), shift.halfDay() ? HALF_DAY_NOTE : null);
    }
}
