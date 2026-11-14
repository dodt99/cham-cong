package com.chamcong.export;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.chamcong.catalog.Catalog;
import com.chamcong.catalog.Catalog.LocationInfo;
import com.chamcong.catalog.Catalog.MemberInfo;
import com.chamcong.catalog.Catalog.OffTypeInfo;
import com.chamcong.catalog.Catalog.ShiftInfo;
import com.chamcong.catalog.CatalogService;
import com.chamcong.catalog.CurrentTeam;
import com.chamcong.catalog.Slot;
import com.chamcong.common.Weeks;
import com.chamcong.export.WeekSchedule.EveningEntry;
import com.chamcong.export.WeekSchedule.MainEntry;
import com.chamcong.export.WeekSchedule.MemberWeek;
import com.chamcong.schedule.Assignment;
import com.chamcong.schedule.AssignmentRepository;

@Component
public class WeekScheduleReader {

    private final CurrentTeam currentTeam;
    private final CatalogService catalogService;
    private final AssignmentRepository assignments;

    WeekScheduleReader(CurrentTeam currentTeam, CatalogService catalogService, AssignmentRepository assignments) {
        this.currentTeam = currentTeam;
        this.catalogService = catalogService;
        this.assignments = assignments;
    }

    @Transactional(readOnly = true)
    public WeekSchedule read(LocalDate weekStart) {
        Weeks.requireMonday(weekStart);
        LocalDate weekEnd = weekStart.plusDays(6);
        Catalog catalog = catalogService.load();
        Map<Long, ShiftInfo> shifts = catalog.shiftsById();
        Map<Long, OffTypeInfo> offTypes = catalog.offTypesById();
        Map<Long, LocationInfo> locations = catalog.locationsById();

        Map<Long, Map<LocalDate, MainEntry>> main = new HashMap<>();
        Map<Long, Map<LocalDate, EveningEntry>> evening = new HashMap<>();
        for (Assignment a : assignments.findByTeamIdAndWorkDateBetween(currentTeam.id(), weekStart, weekEnd)) {
            ShiftInfo shift = a.getShiftId() == null ? null : shifts.get(a.getShiftId());
            LocationInfo location = a.getLocationId() == null ? null : locations.get(a.getLocationId());
            if (a.getSlot() == Slot.MAIN) {
                OffTypeInfo offType = a.getOffTypeId() == null ? null : offTypes.get(a.getOffTypeId());
                main.computeIfAbsent(a.getEmployeeId(), id -> new HashMap<>())
                        .put(a.getWorkDate(), new MainEntry(shift, offType, location));
            } else {
                evening.computeIfAbsent(a.getEmployeeId(), id -> new HashMap<>())
                        .put(a.getWorkDate(), new EveningEntry(shift, location));
            }
        }

        List<MemberWeek> members = catalog.members().stream()
                .filter(m -> m.overlaps(weekStart, weekEnd))
                .map(m -> new MemberWeek(m,
                        withinActivePeriod(m, main.getOrDefault(m.employeeId(), Map.of())),
                        withinActivePeriod(m, evening.getOrDefault(m.employeeId(), Map.of()))))
                .toList();
        return new WeekSchedule(weekStart, catalog.unitName(), catalog.defaultOffType(), members);
    }

    /** Ngày ngoài thời gian hiệu lực của nhân viên được coi như chưa xếp. */
    private static <T> Map<LocalDate, T> withinActivePeriod(MemberInfo member, Map<LocalDate, T> byDate) {
        Map<LocalDate, T> kept = new HashMap<>();
        byDate.forEach((date, entry) -> {
            if (member.isActiveOn(date)) {
                kept.put(date, entry);
            }
        });
        return Map.copyOf(kept);
    }
}
