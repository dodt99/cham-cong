package com.chamcong.schedule;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotNull;

import com.chamcong.catalog.Membership;
import com.chamcong.catalog.Slot;

public final class ScheduleDtos {

    private ScheduleDtos() {
    }

    public record AssignmentDto(long id, long employeeId, LocalDate date, Slot slot, Long shiftId, Long offTypeId,
            Long locationId, int version) {

        static AssignmentDto of(Assignment a) {
            return new AssignmentDto(a.getId(), a.getEmployeeId(), a.getWorkDate(), a.getSlot(), a.getShiftId(),
                    a.getOffTypeId(), a.getLocationId(), a.getVersion());
        }
    }

    public record MemberDto(long employeeId, String code, String fullName, Membership membership) {
    }

    /** Một tuần để hiển thị: danh sách nhân viên theo thứ tự + mọi phân công T2→CN. */
    public record WeekView(LocalDate weekStart, List<LocalDate> days, List<MemberDto> members,
            List<AssignmentDto> assignments) {
    }

    /**
     * Ghi một ô. Khe MAIN: đúng một trong {@code shiftId} / {@code offTypeId}.
     * Khe EVENING: {@code shiftId} có thể bỏ trống nếu đội chỉ có một ca tối.
     * {@code version}: phiên bản client đang thấy; {@code null} nếu client thấy ô trống.
     */
    public record PutCellRequest(@NotNull Long employeeId, @NotNull LocalDate date, @NotNull Slot slot,
            Long shiftId, Long offTypeId, Long locationId, Integer version) {
    }

    public enum BulkMode {
        /** Ghi đè cả T2→T6. */
        OVERWRITE,
        /** Chỉ điền những ngày chưa có gì. */
        FILL_EMPTY
    }

    /** "Áp cho cả tuần": đặt cùng ca (hoặc nghỉ) + địa điểm cho khe MAIN của T2→T6. */
    public record BulkWeekRequest(@NotNull Long employeeId, @NotNull LocalDate weekStart, Long shiftId,
            Long offTypeId, Long locationId, @NotNull BulkMode mode) {
    }
}
