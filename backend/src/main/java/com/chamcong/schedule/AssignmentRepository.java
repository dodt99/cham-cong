package com.chamcong.schedule;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chamcong.catalog.Slot;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByTeamIdAndWorkDateBetween(Long teamId, LocalDate from, LocalDate to);

    Optional<Assignment> findByTeamIdAndEmployeeIdAndWorkDateAndSlot(Long teamId, Long employeeId,
            LocalDate workDate, Slot slot);

    List<Assignment> findByTeamIdAndEmployeeIdAndSlotAndWorkDateBetween(Long teamId, Long employeeId, Slot slot,
            LocalDate from, LocalDate to);
}
