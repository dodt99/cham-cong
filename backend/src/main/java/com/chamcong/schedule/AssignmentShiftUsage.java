package com.chamcong.schedule;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.chamcong.catalog.ShiftUsage;
import com.chamcong.schedule.AssignmentRepository.ShiftCount;

@Component
class AssignmentShiftUsage implements ShiftUsage {

    private final AssignmentRepository assignments;

    AssignmentShiftUsage(AssignmentRepository assignments) {
        this.assignments = assignments;
    }

    @Override
    public Map<Long, Long> assignmentCountByShift(Long teamId) {
        return assignments.countByShift(teamId).stream()
                .collect(Collectors.toMap(ShiftCount::getShiftId, ShiftCount::getTotal));
    }
}
