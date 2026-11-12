package com.chamcong.catalog;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chamcong.catalog.Catalog.BlockInfo;
import com.chamcong.catalog.Catalog.LocationInfo;
import com.chamcong.catalog.Catalog.MemberInfo;
import com.chamcong.catalog.Catalog.OffTypeInfo;
import com.chamcong.catalog.Catalog.ShiftInfo;
import com.chamcong.catalog.Catalog.SiteInfo;
import com.chamcong.catalog.CatalogRepositories.BlockRepository;
import com.chamcong.catalog.CatalogRepositories.EmployeeRepository;
import com.chamcong.catalog.CatalogRepositories.JobPositionRepository;
import com.chamcong.catalog.CatalogRepositories.LocationRepository;
import com.chamcong.catalog.CatalogRepositories.OffTypeRepository;
import com.chamcong.catalog.CatalogRepositories.ShiftRepository;
import com.chamcong.catalog.CatalogRepositories.SiteRepository;
import com.chamcong.catalog.CatalogRepositories.TeamMemberRepository;

@Service
public class CatalogService {

    private final CurrentTeam currentTeam;
    private final SiteRepository sites;
    private final BlockRepository blocks;
    private final LocationRepository locations;
    private final ShiftRepository shifts;
    private final OffTypeRepository offTypes;
    private final TeamMemberRepository members;
    private final EmployeeRepository employees;
    private final JobPositionRepository positions;

    CatalogService(CurrentTeam currentTeam, SiteRepository sites, BlockRepository blocks,
            LocationRepository locations, ShiftRepository shifts, OffTypeRepository offTypes,
            TeamMemberRepository members, EmployeeRepository employees, JobPositionRepository positions) {
        this.currentTeam = currentTeam;
        this.sites = sites;
        this.blocks = blocks;
        this.locations = locations;
        this.shifts = shifts;
        this.offTypes = offTypes;
        this.members = members;
        this.employees = employees;
        this.positions = positions;
    }

    /** Nạp toàn bộ danh mục của đội hiện tại (vài chục dòng mỗi bảng). */
    @Transactional(readOnly = true)
    public Catalog load() {
        Team team = currentTeam.get();
        Long teamId = team.getId();

        List<SiteInfo> siteInfos = sites.findByTeamId(teamId).stream()
                .map(s -> new SiteInfo(s.getId(), s.getCode(), s.getName(), s.isInAllowanceExports()))
                .sorted(Comparator.comparing(SiteInfo::id))
                .toList();
        Map<Long, SiteInfo> siteById = byId(siteInfos, SiteInfo::id);

        List<BlockInfo> blockInfos = blocks.findByTeamId(teamId).stream()
                .map(b -> new BlockInfo(b.getId(), b.getName(), b.getSortOrder(), b.getEveningSortOrder()))
                .sorted(Comparator.comparingInt(BlockInfo::sortOrder))
                .toList();
        Map<Long, BlockInfo> blockById = byId(blockInfos, BlockInfo::id);

        List<LocationInfo> locationInfos = locations.findByTeamId(teamId).stream()
                .map(l -> new LocationInfo(l.getId(), l.getCode(), l.getName(), siteById.get(l.getSiteId()),
                        blockById.get(l.getBlockId()), l.isOnWeekday(), l.isOnEvening(), l.isOnWeekend(),
                        l.getSortOrder(), l.isActive()))
                .sorted(Comparator.comparingInt(LocationInfo::sortOrder))
                .toList();

        List<ShiftInfo> shiftInfos = shifts.findByTeamId(teamId).stream()
                .map(s -> new ShiftInfo(s.getId(), s.getCode(), s.getStartTime(), s.getEndTime(), s.getSlot(),
                        s.isHalfDay(), s.isOnWeekday(), s.isOnWeekend(), s.isEarlyEligible(),
                        s.getEarlyEndTime(), s.getSiteId(), s.getSortOrder(), s.isActive()))
                .sorted(Comparator.comparingInt(ShiftInfo::sortOrder))
                .toList();

        List<OffTypeInfo> offTypeInfos = offTypes.findByTeamId(teamId).stream()
                .map(o -> new OffTypeInfo(o.getId(), o.getCode(), o.getLabel(), o.getFastNote(), o.isDefault(),
                        o.getSortOrder()))
                .sorted(Comparator.comparingInt(OffTypeInfo::sortOrder))
                .toList();

        List<TeamMember> teamMembers = members.findByTeamId(teamId);
        Map<Long, Employee> employeeById = employees
                .findAllById(teamMembers.stream().map(TeamMember::getEmployeeId).toList()).stream()
                .collect(Collectors.toMap(Employee::getId, Function.identity()));
        Map<Long, JobPosition> positionById = positions.findAll().stream()
                .collect(Collectors.toMap(JobPosition::getId, Function.identity()));
        List<MemberInfo> memberInfos = teamMembers.stream()
                .map(m -> {
                    Employee employee = employeeById.get(m.getEmployeeId());
                    JobPosition position = positionById.get(employee.getPositionId());
                    return new MemberInfo(employee.getId(), employee.getCode(), employee.getFullName(),
                            employee.getTaxCode(), position.getTitle(), position.getJobDescription(),
                            m.getMembership(), m.getSortOrder(), m.getActiveFrom(), m.getActiveTo());
                })
                .sorted(Catalog.ROSTER_ORDER)
                .toList();

        return new Catalog(team.getUnitName(), siteInfos, blockInfos, locationInfos, shiftInfos, offTypeInfos,
                memberInfos);
    }

    private static <T> Map<Long, T> byId(List<T> items, Function<T, Long> id) {
        return items.stream().collect(Collectors.toMap(id, Function.identity()));
    }
}
