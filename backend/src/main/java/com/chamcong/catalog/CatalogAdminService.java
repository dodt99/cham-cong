package com.chamcong.catalog;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chamcong.catalog.CatalogAdminDtos.EmployeeDto;
import com.chamcong.catalog.CatalogAdminDtos.EmployeeRequest;
import com.chamcong.catalog.CatalogAdminDtos.LocationDto;
import com.chamcong.catalog.CatalogAdminDtos.LocationRequest;
import com.chamcong.catalog.CatalogAdminDtos.Option;
import com.chamcong.catalog.CatalogAdminDtos.Reference;
import com.chamcong.catalog.CatalogAdminDtos.ShiftDto;
import com.chamcong.catalog.CatalogAdminDtos.ShiftRequest;
import com.chamcong.catalog.CatalogRepositories.BlockRepository;
import com.chamcong.catalog.CatalogRepositories.EmployeeRepository;
import com.chamcong.catalog.CatalogRepositories.JobPositionRepository;
import com.chamcong.catalog.CatalogRepositories.LocationRepository;
import com.chamcong.catalog.CatalogRepositories.ShiftRepository;
import com.chamcong.catalog.CatalogRepositories.SiteRepository;
import com.chamcong.catalog.CatalogRepositories.TeamMemberRepository;
import com.chamcong.common.ApiException;

/**
 * Quản trị danh mục: nhân viên, ca, địa điểm. Không có xoá — nhân viên nghỉ thì đặt ngày kết thúc,
 * ca / địa điểm thôi dùng thì tắt {@code active}, để các tuần cũ vẫn xem và xuất lại được.
 * Ca đã được xếp thì không đổi được loại (ca chính / ca tối); các thuộc tính khác vẫn sửa được
 * và áp dụng cho cả những tuần đã xếp.
 */
@Service
public class CatalogAdminService {

    private final CurrentTeam currentTeam;
    private final EmployeeRepository employees;
    private final TeamMemberRepository members;
    private final JobPositionRepository positions;
    private final SiteRepository sites;
    private final BlockRepository blocks;
    private final ShiftRepository shifts;
    private final LocationRepository locations;
    private final ShiftUsage shiftUsage;

    CatalogAdminService(CurrentTeam currentTeam, EmployeeRepository employees, TeamMemberRepository members,
            JobPositionRepository positions, SiteRepository sites, BlockRepository blocks, ShiftRepository shifts,
            LocationRepository locations, ShiftUsage shiftUsage) {
        this.currentTeam = currentTeam;
        this.employees = employees;
        this.members = members;
        this.positions = positions;
        this.sites = sites;
        this.blocks = blocks;
        this.shifts = shifts;
        this.locations = locations;
        this.shiftUsage = shiftUsage;
    }

    @Transactional(readOnly = true)
    public Reference reference() {
        Long teamId = currentTeam.id();
        return new Reference(
                positions.findAll().stream().sorted(Comparator.comparing(JobPosition::getId))
                        .map(p -> new Option(p.getId(), p.getTitle() + " — " + p.getJobDescription())).toList(),
                sites.findByTeamId(teamId).stream().sorted(Comparator.comparing(Site::getId))
                        .map(s -> new Option(s.getId(), s.getName())).toList(),
                blocks.findByTeamId(teamId).stream().sorted(Comparator.comparingInt(Block::getSortOrder))
                        .map(b -> new Option(b.getId(), b.getName())).toList());
    }

    // ---- nhân viên -----------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<EmployeeDto> employees() {
        List<TeamMember> teamMembers = members.findByTeamId(currentTeam.id());
        Map<Long, Employee> byId = employees
                .findAllById(teamMembers.stream().map(TeamMember::getEmployeeId).toList()).stream()
                .collect(Collectors.toMap(Employee::getId, Function.identity()));
        return teamMembers.stream()
                .sorted(Comparator.comparing(TeamMember::getMembership).thenComparingInt(TeamMember::getSortOrder))
                .map(m -> toDto(byId.get(m.getEmployeeId()), m))
                .toList();
    }

    @Transactional
    public EmployeeDto createEmployee(EmployeeRequest request) {
        validate(request);
        if (employees.existsByCode(request.code().trim())) {
            throw ApiException.conflict("EMPLOYEE_CODE_TAKEN", "Mã nhân viên đã tồn tại.", null);
        }
        Long teamId = currentTeam.id();
        Employee employee = new Employee();
        apply(employee, request);
        employees.save(employee);

        TeamMember member = new TeamMember();
        member.setTeamId(teamId);
        member.setEmployeeId(employee.getId());
        apply(member, request, nextSortOrder(teamId, request.membership()));
        members.save(member);
        return toDto(employee, member);
    }

    @Transactional
    public EmployeeDto updateEmployee(Long employeeId, EmployeeRequest request) {
        validate(request);
        TeamMember member = members.findByTeamIdAndEmployeeId(currentTeam.id(), employeeId)
                .orElseThrow(() -> ApiException.notFound("EMPLOYEE_NOT_FOUND", "Không tìm thấy nhân viên."));
        Employee employee = employees.findById(employeeId).orElseThrow();
        if (!employee.getCode().equals(request.code().trim()) && employees.existsByCode(request.code().trim())) {
            throw ApiException.conflict("EMPLOYEE_CODE_TAKEN", "Mã nhân viên đã tồn tại.", null);
        }
        apply(employee, request);
        apply(member, request, member.getSortOrder());
        return toDto(employee, member);
    }

    private void validate(EmployeeRequest request) {
        if (!positions.existsById(request.positionId())) {
            throw ApiException.badRequest("POSITION_INVALID", "Chức danh không hợp lệ.");
        }
        if (request.activeFrom() != null && request.activeTo() != null
                && request.activeTo().isBefore(request.activeFrom())) {
            throw ApiException.badRequest("ACTIVE_RANGE_INVALID", "Ngày kết thúc phải sau ngày bắt đầu.");
        }
    }

    private static void apply(Employee employee, EmployeeRequest request) {
        employee.setCode(request.code().trim());
        employee.setFullName(request.fullName().trim());
        employee.setTaxCode(request.taxCode().trim());
        employee.setPositionId(request.positionId());
    }

    private static void apply(TeamMember member, EmployeeRequest request, int defaultSortOrder) {
        member.setMembership(request.membership());
        member.setSortOrder(request.sortOrder() != null ? request.sortOrder() : defaultSortOrder);
        member.setActiveFrom(request.activeFrom());
        member.setActiveTo(request.activeTo());
    }

    private int nextSortOrder(Long teamId, Membership membership) {
        return members.findByTeamId(teamId).stream()
                .filter(m -> m.getMembership() == membership)
                .mapToInt(TeamMember::getSortOrder).max().orElse(0) + 10;
    }

    private static EmployeeDto toDto(Employee e, TeamMember m) {
        return new EmployeeDto(e.getId(), e.getCode(), e.getFullName(), e.getTaxCode(), e.getPositionId(),
                m.getMembership(), m.getSortOrder(), m.getActiveFrom(), m.getActiveTo());
    }

    // ---- ca làm việc ---------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ShiftDto> shifts() {
        Long teamId = currentTeam.id();
        Map<Long, Long> usage = shiftUsage.assignmentCountByShift(teamId);
        return shifts.findByTeamId(teamId).stream()
                .sorted(Comparator.comparingInt(Shift::getSortOrder))
                .map(shift -> toDto(shift, usage.getOrDefault(shift.getId(), 0L))).toList();
    }

    @Transactional
    public ShiftDto createShift(ShiftRequest request) {
        Shift shift = new Shift();
        shift.setTeamId(currentTeam.id());
        apply(shift, request);
        return toDto(shifts.save(shift), 0);
    }

    @Transactional
    public ShiftDto updateShift(Long id, ShiftRequest request) {
        Shift shift = shifts.findById(id).filter(s -> s.getTeamId().equals(currentTeam.id()))
                .orElseThrow(() -> ApiException.notFound("SHIFT_NOT_FOUND", "Không tìm thấy ca."));
        long usageCount = shiftUsage.assignmentCountByShift(shift.getTeamId()).getOrDefault(id, 0L);
        // Phân công khe MAIN không được trỏ tới ca tối (và ngược lại), nên ca đã xếp phải giữ nguyên loại.
        if (usageCount > 0 && shift.getSlot() != request.slot()) {
            throw ApiException.conflict("SHIFT_IN_USE",
                    "Ca này đã được xếp nên không đổi được loại ca. Hãy tạo ca mới và tắt “Đang dùng” ở ca cũ.", null);
        }
        apply(shift, request);
        return toDto(shift, usageCount);
    }

    private void apply(Shift shift, ShiftRequest request) {
        Long teamId = currentTeam.id();
        if (!request.endTime().isAfter(request.startTime())) {
            throw ApiException.badRequest("SHIFT_TIME_INVALID", "Giờ kết thúc phải sau giờ bắt đầu.");
        }
        if (request.slot() == Slot.EVENING && request.halfDay()) {
            throw ApiException.badRequest("EVENING_HALF_DAY", "Ca tối không thể là ca nghỉ chiều.");
        }
        if (request.siteId() != null) {
            requireSite(teamId, request.siteId());
        }
        String code = request.code().trim();
        boolean taken = shifts.findByTeamId(teamId).stream().anyMatch(other -> !other.getId().equals(shift.getId())
                && other.getCode().equals(code) && other.isHalfDay() == request.halfDay());
        if (taken) {
            throw ApiException.conflict("SHIFT_CODE_TAKEN",
                    "Đã có ca cùng mã" + (request.halfDay() ? " (nghỉ chiều)." : " (cả ngày)."), null);
        }
        shift.setCode(code);
        shift.setStartTime(request.startTime());
        shift.setEndTime(request.endTime());
        shift.setSlot(request.slot());
        shift.setHalfDay(request.halfDay());
        shift.setOnWeekday(request.onWeekday());
        shift.setOnWeekend(request.onWeekend());
        shift.setSiteId(request.siteId());
        shift.setEarlyEligible(request.earlyEligible());
        shift.setEarlyEndTime(request.earlyEndTime());
        shift.setSortOrder(request.sortOrder());
        shift.setActive(request.active());
    }

    private static ShiftDto toDto(Shift s, long usageCount) {
        return new ShiftDto(s.getId(), s.getCode(), s.getStartTime(), s.getEndTime(), s.getSlot(), s.isHalfDay(),
                s.isOnWeekday(), s.isOnWeekend(), s.getSiteId(), s.isEarlyEligible(), s.getEarlyEndTime(),
                s.getSortOrder(), s.isActive(), usageCount);
    }

    // ---- địa điểm ------------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<LocationDto> locations() {
        return locations.findByTeamId(currentTeam.id()).stream()
                .sorted(Comparator.comparingInt(Location::getSortOrder)).map(CatalogAdminService::toDto).toList();
    }

    @Transactional
    public LocationDto createLocation(LocationRequest request) {
        Location location = new Location();
        location.setTeamId(currentTeam.id());
        apply(location, request);
        return toDto(locations.save(location));
    }

    @Transactional
    public LocationDto updateLocation(Long id, LocationRequest request) {
        Location location = locations.findById(id).filter(l -> l.getTeamId().equals(currentTeam.id()))
                .orElseThrow(() -> ApiException.notFound("LOCATION_NOT_FOUND", "Không tìm thấy địa điểm."));
        apply(location, request);
        return toDto(location);
    }

    private void apply(Location location, LocationRequest request) {
        Long teamId = currentTeam.id();
        requireSite(teamId, request.siteId());
        blocks.findById(request.blockId()).filter(b -> b.getTeamId().equals(teamId))
                .orElseThrow(() -> ApiException.badRequest("BLOCK_INVALID", "Block không hợp lệ."));
        String code = request.code().trim();
        boolean taken = locations.findByTeamId(teamId).stream()
                .anyMatch(other -> !other.getId().equals(location.getId()) && other.getCode().equals(code));
        if (taken) {
            throw ApiException.conflict("LOCATION_CODE_TAKEN", "Mã địa điểm đã tồn tại.", null);
        }
        location.setCode(code);
        location.setName(request.name().trim());
        location.setSiteId(request.siteId());
        location.setBlockId(request.blockId());
        location.setOnWeekday(request.onWeekday());
        location.setOnEvening(request.onEvening());
        location.setOnWeekend(request.onWeekend());
        location.setSortOrder(request.sortOrder());
        location.setActive(request.active());
    }

    private static LocationDto toDto(Location l) {
        return new LocationDto(l.getId(), l.getCode(), l.getName(), l.getSiteId(), l.getBlockId(), l.isOnWeekday(),
                l.isOnEvening(), l.isOnWeekend(), l.getSortOrder(), l.isActive());
    }

    private void requireSite(Long teamId, Long siteId) {
        sites.findById(siteId).filter(s -> s.getTeamId().equals(teamId))
                .orElseThrow(() -> ApiException.badRequest("SITE_INVALID", "Cơ sở không hợp lệ."));
    }
}
