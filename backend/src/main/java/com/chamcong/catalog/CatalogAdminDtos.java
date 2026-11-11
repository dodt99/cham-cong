package com.chamcong.catalog;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class CatalogAdminDtos {

    private CatalogAdminDtos() {
    }

    public record Option(long id, String label) {
    }

    /** Danh sách chọn cho các biểu mẫu quản trị. */
    public record Reference(List<Option> positions, List<Option> sites, List<Option> blocks) {
    }

    public record EmployeeDto(long employeeId, String code, String fullName, String taxCode, long positionId,
            Membership membership, int sortOrder, LocalDate activeFrom, LocalDate activeTo) {
    }

    /** {@code sortOrder} bỏ trống khi tạo mới = xếp cuối nhóm. */
    public record EmployeeRequest(@NotBlank String code, @NotBlank String fullName, @NotBlank String taxCode,
            @NotNull Long positionId, @NotNull Membership membership, Integer sortOrder, LocalDate activeFrom,
            LocalDate activeTo) {
    }

    public record ShiftDto(long id, String code, LocalTime startTime, LocalTime endTime, Slot slot, boolean halfDay,
            boolean onWeekday, boolean onWeekend, Long siteId, boolean earlyEligible, LocalTime earlyEndTime,
            int sortOrder, boolean active) {
    }

    public record ShiftRequest(@NotBlank String code, @NotNull LocalTime startTime, @NotNull LocalTime endTime,
            @NotNull Slot slot, boolean halfDay, boolean onWeekday, boolean onWeekend, Long siteId,
            boolean earlyEligible, LocalTime earlyEndTime, @NotNull Integer sortOrder, boolean active) {
    }

    public record LocationDto(long id, String code, String name, long siteId, long blockId, boolean onWeekday,
            boolean onEvening, boolean onWeekend, int sortOrder, boolean active) {
    }

    public record LocationRequest(@NotBlank String code, @NotBlank String name, @NotNull Long siteId,
            @NotNull Long blockId, boolean onWeekday, boolean onEvening, boolean onWeekend,
            @NotNull Integer sortOrder, boolean active) {
    }
}
