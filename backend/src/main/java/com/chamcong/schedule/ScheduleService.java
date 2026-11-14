package com.chamcong.schedule;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chamcong.auth.CurrentUserProvider;
import com.chamcong.catalog.Catalog;
import com.chamcong.catalog.CatalogRepositories.LocationRepository;
import com.chamcong.catalog.CatalogRepositories.OffTypeRepository;
import com.chamcong.catalog.CatalogRepositories.ShiftRepository;
import com.chamcong.catalog.CatalogRepositories.TeamMemberRepository;
import com.chamcong.catalog.CatalogService;
import com.chamcong.catalog.CurrentTeam;
import com.chamcong.catalog.Location;
import com.chamcong.catalog.Membership;
import com.chamcong.catalog.OffType;
import com.chamcong.catalog.Shift;
import com.chamcong.catalog.Slot;
import com.chamcong.catalog.TeamMember;
import com.chamcong.common.ApiException;
import com.chamcong.common.Weeks;
import com.chamcong.schedule.ScheduleDtos.AssignmentDto;
import com.chamcong.schedule.ScheduleDtos.BulkMode;
import com.chamcong.schedule.ScheduleDtos.BulkWeekRequest;
import com.chamcong.schedule.ScheduleDtos.MemberDto;
import com.chamcong.schedule.ScheduleDtos.PutCellRequest;
import com.chamcong.schedule.ScheduleDtos.WeekView;

@Service
public class ScheduleService {

    private final CurrentTeam currentTeam;
    private final CurrentUserProvider currentUser;
    private final CatalogService catalogService;
    private final AssignmentRepository assignments;
    private final TeamMemberRepository members;
    private final ShiftRepository shifts;
    private final OffTypeRepository offTypes;
    private final LocationRepository locations;

    ScheduleService(CurrentTeam currentTeam, CurrentUserProvider currentUser, CatalogService catalogService,
            AssignmentRepository assignments, TeamMemberRepository members, ShiftRepository shifts,
            OffTypeRepository offTypes, LocationRepository locations) {
        this.currentTeam = currentTeam;
        this.currentUser = currentUser;
        this.catalogService = catalogService;
        this.assignments = assignments;
        this.members = members;
        this.shifts = shifts;
        this.offTypes = offTypes;
        this.locations = locations;
    }

    @Transactional(readOnly = true)
    public WeekView week(LocalDate weekStart) {
        Weeks.requireMonday(weekStart);
        LocalDate weekEnd = weekStart.plusDays(6);
        Catalog catalog = catalogService.load();
        List<MemberDto> roster = catalog.members().stream()
                .filter(m -> m.overlaps(weekStart, weekEnd))
                .map(m -> new MemberDto(m.employeeId(), m.code(), m.fullName(), m.membership()))
                .toList();
        List<AssignmentDto> cells = assignments
                .findByTeamIdAndWorkDateBetween(currentTeam.id(), weekStart, weekEnd).stream()
                .map(AssignmentDto::of)
                .toList();
        return new WeekView(weekStart, Weeks.days(weekStart), roster, cells);
    }

    /** Ghi một ô, có kiểm tra phiên bản để không đè lên thay đổi của người khác. */
    @Transactional
    public AssignmentDto put(PutCellRequest request) {
        Long teamId = currentTeam.id();
        CellContent content = resolve(teamId, request.employeeId(), request.date(), request.slot(),
                request.shiftId(), request.offTypeId(), request.locationId());

        Optional<Assignment> existing = assignments.findByTeamIdAndEmployeeIdAndWorkDateAndSlot(teamId,
                request.employeeId(), request.date(), request.slot());
        requireSameVersion(existing, request.version());

        Assignment assignment = existing.orElseGet(
                () -> new Assignment(teamId, request.employeeId(), request.date(), request.slot()));
        content.applyTo(assignment, currentUser.requireId());
        return AssignmentDto.of(save(assignment));
    }

    /** Xoá một ô (đưa ngày về trạng thái chưa xếp / bỏ ca tối). */
    @Transactional
    public void delete(Long employeeId, LocalDate date, Slot slot, Integer version) {
        Optional<Assignment> existing = assignments.findByTeamIdAndEmployeeIdAndWorkDateAndSlot(
                currentTeam.id(), employeeId, date, slot);
        if (existing.isEmpty()) {
            return;
        }
        requireSameVersion(existing, version);
        assignments.delete(existing.get());
    }

    /** "Áp cho cả tuần": cùng một nội dung cho khe MAIN của T2→T6. Trả về các ô đã ghi. */
    @Transactional
    public List<AssignmentDto> applyToWeekdays(BulkWeekRequest request) {
        Weeks.requireMonday(request.weekStart());
        Long teamId = currentTeam.id();
        Long userId = currentUser.requireId();
        TeamMember member = requireMember(teamId, request.employeeId());

        LocalDate monday = request.weekStart();
        Set<LocalDate> filled = assignments
                .findByTeamIdAndEmployeeIdAndSlotAndWorkDateBetween(teamId, request.employeeId(), Slot.MAIN,
                        monday, monday.plusDays(4))
                .stream().map(Assignment::getWorkDate).collect(Collectors.toSet());

        List<Assignment> written = new ArrayList<>();
        for (LocalDate date : Weeks.weekdays(monday)) {
            if (!isActiveOn(member, date) || (request.mode() == BulkMode.FILL_EMPTY && filled.contains(date))) {
                continue;
            }
            CellContent content = resolve(teamId, request.employeeId(), date, Slot.MAIN, request.shiftId(),
                    request.offTypeId(), request.locationId());
            Assignment assignment = assignments
                    .findByTeamIdAndEmployeeIdAndWorkDateAndSlot(teamId, request.employeeId(), date, Slot.MAIN)
                    .orElseGet(() -> new Assignment(teamId, request.employeeId(), date, Slot.MAIN));
            content.applyTo(assignment, userId);
            written.add(save(assignment));
        }
        return written.stream().map(AssignmentDto::of).toList();
    }

    // ---- quy tắc nhập liệu -------------------------------------------------------------------

    /** Nội dung hợp lệ của một ô sau khi đã đối chiếu danh mục. */
    private record CellContent(Long shiftId, Long offTypeId, Long locationId) {

        void applyTo(Assignment assignment, Long userId) {
            if (offTypeId != null) {
                assignment.assignOff(offTypeId, userId);
            } else {
                assignment.assignShift(shiftId, locationId, userId);
            }
        }
    }

    private CellContent resolve(Long teamId, Long employeeId, LocalDate date, Slot slot, Long shiftId,
            Long offTypeId, Long locationId) {
        TeamMember member = requireMember(teamId, employeeId);
        if (!isActiveOn(member, date)) {
            throw ApiException.badRequest("MEMBER_INACTIVE", "Nhân viên không thuộc đội vào ngày này.");
        }
        boolean weekend = Weeks.isWeekend(date);

        if (slot == Slot.MAIN) {
            if (member.getMembership() == Membership.SUPPORT && !weekend) {
                throw ApiException.badRequest("SUPPORT_WEEKDAY",
                        "Nhân viên tăng cường chỉ được xếp ca tối và T7-CN.");
            }
            if ((shiftId == null) == (offTypeId == null)) {
                throw ApiException.badRequest("SHIFT_XOR_OFF", "Phải chọn đúng một trong ca làm việc hoặc loại nghỉ.");
            }
            if (offTypeId != null) {
                OffType offType = offTypes.findById(offTypeId).filter(o -> o.getTeamId().equals(teamId))
                        .orElseThrow(() -> ApiException.badRequest("OFF_TYPE_INVALID", "Loại nghỉ không hợp lệ."));
                return new CellContent(null, offType.getId(), null);
            }
        } else if (offTypeId != null) {
            throw ApiException.badRequest("EVENING_OFF", "Ca tối không có loại nghỉ.");
        }

        Shift shift = shiftId != null
                ? shifts.findById(shiftId).filter(s -> s.getTeamId().equals(teamId))
                        .orElseThrow(() -> ApiException.badRequest("SHIFT_INVALID", "Ca làm việc không hợp lệ."))
                : onlyEveningShift(teamId);
        boolean shiftFitsDay = weekend ? shift.isOnWeekend() : shift.isOnWeekday();
        if (shift.getSlot() != slot || !shift.isActive() || !shiftFitsDay) {
            throw ApiException.badRequest("SHIFT_NOT_ALLOWED", "Ca này không dùng được cho ô đang chọn.");
        }

        if (locationId == null) {
            return new CellContent(shift.getId(), null, null);
        }
        Location location = locations.findById(locationId).filter(l -> l.getTeamId().equals(teamId))
                .orElseThrow(() -> ApiException.badRequest("LOCATION_INVALID", "Địa điểm không hợp lệ."));
        boolean locationFits = slot == Slot.EVENING ? location.isOnEvening()
                : weekend ? location.isOnWeekend() : location.isOnWeekday();
        if (!location.isActive() || !locationFits) {
            throw ApiException.badRequest("LOCATION_NOT_ALLOWED", "Địa điểm này không dùng được cho ô đang chọn.");
        }
        return new CellContent(shift.getId(), null, location.getId());
    }

    private Shift onlyEveningShift(Long teamId) {
        List<Shift> evening = shifts.findByTeamId(teamId).stream()
                .filter(s -> s.getSlot() == Slot.EVENING && s.isActive())
                .toList();
        if (evening.size() != 1) {
            throw ApiException.badRequest("SHIFT_REQUIRED", "Cần chỉ rõ ca tối.");
        }
        return evening.get(0);
    }

    private TeamMember requireMember(Long teamId, Long employeeId) {
        return members.findByTeamIdAndEmployeeId(teamId, employeeId)
                .orElseThrow(() -> ApiException.badRequest("NOT_A_MEMBER", "Nhân viên không thuộc đội."));
    }

    private static boolean isActiveOn(TeamMember member, LocalDate date) {
        return (member.getActiveFrom() == null || !date.isBefore(member.getActiveFrom()))
                && (member.getActiveTo() == null || !date.isAfter(member.getActiveTo()));
    }

    // ---- khoá lạc quan -------------------------------------------------------------------------

    private static void requireSameVersion(Optional<Assignment> existing, Integer clientVersion) {
        Integer currentVersion = existing.map(Assignment::getVersion).orElse(null);
        if (!Objects.equals(currentVersion, clientVersion)) {
            throw conflict(existing.map(AssignmentDto::of).orElse(null));
        }
    }

    private Assignment save(Assignment assignment) {
        try {
            return assignments.saveAndFlush(assignment);
        } catch (DataIntegrityViolationException | ObjectOptimisticLockingFailureException e) {
            // Người khác vừa ghi cùng ô trong lúc request này đang chạy.
            throw conflict(null);
        }
    }

    private static ApiException conflict(AssignmentDto current) {
        return ApiException.conflict("VERSION_CONFLICT",
                "Ô này vừa được người khác thay đổi. Dữ liệu mới nhất đã được tải lại.", current);
    }
}
