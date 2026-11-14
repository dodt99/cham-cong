package com.chamcong.schedule;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.chamcong.catalog.Slot;
import com.chamcong.schedule.ScheduleDtos.AssignmentDto;
import com.chamcong.schedule.ScheduleDtos.BulkWeekRequest;
import com.chamcong.schedule.ScheduleDtos.PutCellRequest;
import com.chamcong.schedule.ScheduleDtos.WeekView;

@RestController
class ScheduleController {

    private final ScheduleService scheduleService;

    ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/api/schedule")
    WeekView week(@RequestParam LocalDate weekStart) {
        return scheduleService.week(weekStart);
    }

    @PutMapping("/api/assignments")
    AssignmentDto put(@Valid @RequestBody PutCellRequest request) {
        return scheduleService.put(request);
    }

    @DeleteMapping("/api/assignments")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@RequestParam Long employeeId, @RequestParam LocalDate date, @RequestParam Slot slot,
            @RequestParam(required = false) Integer version) {
        scheduleService.delete(employeeId, date, slot, version);
    }

    @PostMapping("/api/assignments/bulk")
    List<AssignmentDto> applyToWeekdays(@Valid @RequestBody BulkWeekRequest request) {
        return scheduleService.applyToWeekdays(request);
    }
}
