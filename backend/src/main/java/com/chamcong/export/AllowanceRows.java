package com.chamcong.export;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import com.chamcong.catalog.Catalog.LocationInfo;
import com.chamcong.catalog.Catalog.ShiftInfo;
import com.chamcong.common.Weeks;
import com.chamcong.export.WeekSchedule.EveningEntry;
import com.chamcong.export.WeekSchedule.MemberWeek;

/**
 * Dựng dòng cho ba file thanh toán: Làm sớm (7.2), Làm tối (7.3), T7-CN (7.4).
 * Cả ba cùng dạng "một dòng = một nhân viên làm một ngày".
 */
public final class AllowanceRows {

    private AllowanceRows() {
    }

    /** Một dòng thanh toán; {@code jobTitle}/{@code jobDescription}/{@code note} chỉ file Làm sớm dùng. */
    public record AllowanceRow(LocalDate workDate, String employeeCode, String fullName, String taxCode,
            LocalTime start, LocalTime end, String block, String jobTitle, String jobDescription, String note) {
    }

    /**
     * Làm sớm: đội chính, T2→T6, theo nhân viên rồi theo ngày. Bỏ ca không tính làm sớm
     * và địa điểm thuộc cơ sở không lên file thanh toán.
     */
    public static List<AllowanceRow> early(WeekSchedule schedule) {
        List<AllowanceRow> rows = new ArrayList<>();
        for (MemberWeek member : schedule.coreMembers()) {
            for (LocalDate date : Weeks.weekdays(schedule.weekStart())) {
                ShiftInfo shift = member.shiftOn(date);
                LocationInfo location = member.locationOn(date);
                if (shift == null || !shift.earlyEligible() || !inAllowanceExports(location)) {
                    continue;
                }
                LocalTime end = shift.earlyEndTime() != null ? shift.earlyEndTime() : shift.endTime();
                rows.add(new AllowanceRow(date, member.member().code(), member.member().fullName(),
                        member.member().taxCode(), shift.startTime(), end, blockName(location),
                        member.member().positionTitle(), member.member().positionJobDescription(),
                        shift.halfDay() ? FastRows.HALF_DAY_NOTE : null));
            }
        }
        return rows;
    }

    /** Làm tối: cả đội + tăng cường, T2→T6, theo ngày rồi theo thứ tự block của file Tối. */
    public static List<AllowanceRow> evening(WeekSchedule schedule) {
        List<AllowanceRow> rows = new ArrayList<>();
        for (LocalDate date : Weeks.weekdays(schedule.weekStart())) {
            List<Ranked> day = new ArrayList<>();
            for (MemberWeek member : schedule.members()) {
                EveningEntry entry = member.evening().get(date);
                if (entry == null) {
                    continue;
                }
                Integer order = entry.location() == null ? null : entry.location().block().eveningSortOrder();
                day.add(new Ranked(order == null ? Integer.MAX_VALUE : order,
                        row(member, date, entry.shift(), entry.location())));
            }
            rows.addAll(sorted(day));
        }
        return rows;
    }

    /** T7-CN của một ngày: cả đội + tăng cường có ca, theo thứ tự block; bỏ cơ sở không lên file thanh toán. */
    public static List<AllowanceRow> weekendDay(WeekSchedule schedule, LocalDate date) {
        List<Ranked> day = new ArrayList<>();
        for (MemberWeek member : schedule.members()) {
            ShiftInfo shift = member.shiftOn(date);
            LocationInfo location = member.locationOn(date);
            if (shift == null || !inAllowanceExports(location)) {
                continue;
            }
            day.add(new Ranked(location == null ? Integer.MAX_VALUE : location.block().sortOrder(),
                    row(member, date, shift, location)));
        }
        return sorted(day);
    }

    private record Ranked(int blockOrder, AllowanceRow row) {
    }

    /** Sắp xếp ổn định: cùng block thì giữ thứ tự danh sách nhân viên; chưa có địa điểm xuống cuối. */
    private static List<AllowanceRow> sorted(List<Ranked> ranked) {
        return ranked.stream().sorted(Comparator.comparingInt(Ranked::blockOrder)).map(Ranked::row).toList();
    }

    private static AllowanceRow row(MemberWeek member, LocalDate date, ShiftInfo shift, LocationInfo location) {
        return new AllowanceRow(date, member.member().code(), member.member().fullName(),
                member.member().taxCode(), shift.startTime(), shift.endTime(), blockName(location), null, null,
                null);
    }

    private static boolean inAllowanceExports(LocationInfo location) {
        return location == null || location.site().inAllowanceExports();
    }

    private static String blockName(LocationInfo location) {
        return location == null ? null : location.block().name();
    }
}
