package com.chamcong.catalog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

/** Repository của các bảng danh mục, gom một file vì đều chỉ là truy vấn theo đội. */
public final class CatalogRepositories {

    private CatalogRepositories() {
    }

    public interface TeamRepository extends JpaRepository<Team, Long> {
        Optional<Team> findByCode(String code);
    }

    public interface JobPositionRepository extends JpaRepository<JobPosition, Long> {
    }

    public interface EmployeeRepository extends JpaRepository<Employee, Long> {
        boolean existsByCode(String code);
    }

    public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
        List<TeamMember> findByTeamId(Long teamId);

        Optional<TeamMember> findByTeamIdAndEmployeeId(Long teamId, Long employeeId);
    }

    public interface SiteRepository extends JpaRepository<Site, Long> {
        List<Site> findByTeamId(Long teamId);
    }

    public interface BlockRepository extends JpaRepository<Block, Long> {
        List<Block> findByTeamId(Long teamId);
    }

    public interface LocationRepository extends JpaRepository<Location, Long> {
        List<Location> findByTeamId(Long teamId);
    }

    public interface ShiftRepository extends JpaRepository<Shift, Long> {
        List<Shift> findByTeamId(Long teamId);
    }

    public interface OffTypeRepository extends JpaRepository<OffType, Long> {
        List<OffType> findByTeamId(Long teamId);
    }
}
