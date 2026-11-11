package com.chamcong.export;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.chamcong.catalog.Catalog.LocationInfo;
import com.chamcong.catalog.Catalog.MemberInfo;
import com.chamcong.catalog.Catalog.OffTypeInfo;
import com.chamcong.catalog.Catalog.ShiftInfo;
import com.chamcong.catalog.Membership;

/**
 * Lịch một tuần đã nối sẵn danh mục — đầu vào duy nhất của mọi bộ dựng dòng export.
 * {@code members} theo thứ tự danh sách: đội chính rồi tăng cường.
 */
public record WeekSchedule(LocalDate weekStart, String unitName, OffTypeInfo defaultOffType,
        List<MemberWeek> members) {

    /** Khe MAIN của một ngày: có ca (kèm địa điểm, có thể trống) hoặc có loại nghỉ. */
    public record MainEntry(ShiftInfo shift, OffTypeInfo offType, LocationInfo location) {
    }

    /** Khe EVENING của một ngày. */
    public record EveningEntry(ShiftInfo shift, LocationInfo location) {
    }

    /** Ngày không có trong map = chưa xếp. */
    public record MemberWeek(MemberInfo member, Map<LocalDate, MainEntry> main,
            Map<LocalDate, EveningEntry> evening) {

        /** Ca chính của ngày, {@code null} nếu nghỉ hoặc chưa xếp. */
        public ShiftInfo shiftOn(LocalDate date) {
            MainEntry entry = main.get(date);
            return entry == null ? null : entry.shift();
        }

        public LocationInfo locationOn(LocalDate date) {
            MainEntry entry = main.get(date);
            return entry == null ? null : entry.location();
        }
    }

    /** Đội chính — danh sách của file Fast và Làm sớm. */
    public List<MemberWeek> coreMembers() {
        return members.stream().filter(m -> m.member().membership() == Membership.CORE).toList();
    }
}
