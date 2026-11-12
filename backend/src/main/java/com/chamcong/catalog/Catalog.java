package com.chamcong.catalog;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Ảnh chụp bất biến toàn bộ danh mục của một đội, đã nối sẵn block / cơ sở / chức danh.
 * Tầng nhập liệu và tầng export chỉ làm việc với các record này, không đụng tới entity.
 */
public record Catalog(
        String unitName,
        List<SiteInfo> sites,
        List<BlockInfo> blocks,
        List<LocationInfo> locations,
        List<ShiftInfo> shifts,
        List<OffTypeInfo> offTypes,
        List<MemberInfo> members) {

    public record SiteInfo(long id, String code, String name, boolean inAllowanceExports) {
    }

    public record BlockInfo(long id, String name, int sortOrder, Integer eveningSortOrder) {
    }

    public record LocationInfo(long id, String code, String name, SiteInfo site, BlockInfo block,
            boolean onWeekday, boolean onEvening, boolean onWeekend, int sortOrder, boolean active) {
    }

    public record ShiftInfo(long id, String code, LocalTime startTime, LocalTime endTime, Slot slot,
            boolean halfDay, boolean onWeekday, boolean onWeekend, boolean earlyEligible,
            LocalTime earlyEndTime, Long siteId, int sortOrder, boolean active) {
    }

    public record OffTypeInfo(long id, String code, String label, String fastNote, boolean isDefault,
            int sortOrder) {
    }

    public record MemberInfo(long employeeId, String code, String fullName, String taxCode,
            String positionTitle, String positionJobDescription, Membership membership, int sortOrder,
            LocalDate activeFrom, LocalDate activeTo) {

        public boolean isActiveOn(LocalDate date) {
            return (activeFrom == null || !date.isBefore(activeFrom))
                    && (activeTo == null || !date.isAfter(activeTo));
        }

        /** Có hiệu lực ít nhất một ngày trong khoảng [from, to]. */
        public boolean overlaps(LocalDate from, LocalDate to) {
            return (activeFrom == null || !activeFrom.isAfter(to))
                    && (activeTo == null || !activeTo.isBefore(from));
        }
    }

    /** Thứ tự danh sách nhân viên: đội chính trước, tăng cường sau, mỗi nhóm theo sort_order. */
    public static final Comparator<MemberInfo> ROSTER_ORDER =
            Comparator.comparing(MemberInfo::membership).thenComparingInt(MemberInfo::sortOrder);

    public Map<Long, ShiftInfo> shiftsById() {
        return shifts.stream().collect(Collectors.toMap(ShiftInfo::id, Function.identity()));
    }

    public Map<Long, LocationInfo> locationsById() {
        return locations.stream().collect(Collectors.toMap(LocationInfo::id, Function.identity()));
    }

    public Map<Long, OffTypeInfo> offTypesById() {
        return offTypes.stream().collect(Collectors.toMap(OffTypeInfo::id, Function.identity()));
    }

    public Map<Long, MemberInfo> membersByEmployeeId() {
        return members.stream().collect(Collectors.toMap(MemberInfo::employeeId, Function.identity()));
    }

    public OffTypeInfo defaultOffType() {
        return offTypes.stream().filter(OffTypeInfo::isDefault).findFirst()
                .orElseThrow(() -> new IllegalStateException("Danh mục thiếu loại nghỉ mặc định"));
    }
}
