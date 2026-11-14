package com.chamcong.schedule;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.chamcong.catalog.Slot;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByTeamIdAndWorkDateBetween(Long teamId, LocalDate from, LocalDate to);

    Optional<Assignment> findByTeamIdAndEmployeeIdAndWorkDateAndSlot(Long teamId, Long employeeId,
            LocalDate workDate, Slot slot);

    List<Assignment> findByTeamIdAndEmployeeIdAndSlotAndWorkDateBetween(Long teamId, Long employeeId, Slot slot,
            LocalDate from, LocalDate to);

    interface ShiftCount {
        Long getShiftId();

        long getTotal();
    }

    @Query("""
            select a.shiftId as shiftId, count(a) as total from Assignment a
            where a.teamId = :teamId and a.shiftId is not null group by a.shiftId
            """)
    List<ShiftCount> countByShift(@Param("teamId") Long teamId);
}
