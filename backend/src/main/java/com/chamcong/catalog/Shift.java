package com.chamcong.catalog;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Ca làm việc. Mã ca không duy nhất: "2K43" có bản cả ngày và bản nghỉ chiều. */
@Entity
@Table(name = "shift")
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id")
    private Long teamId;

    @Column(name = "site_id")
    private Long siteId;

    private String code;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    private Slot slot;

    @Column(name = "half_day")
    private boolean halfDay;

    @Column(name = "on_weekday")
    private boolean onWeekday;

    @Column(name = "on_weekend")
    private boolean onWeekend;

    @Column(name = "early_eligible")
    private boolean earlyEligible;

    @Column(name = "early_end_time")
    private LocalTime earlyEndTime;

    @Column(name = "sort_order")
    private int sortOrder;

    private boolean active;

    protected Shift() {
    }

    public Long getId() {
        return id;
    }

    public Long getTeamId() {
        return teamId;
    }

    public Long getSiteId() {
        return siteId;
    }

    public String getCode() {
        return code;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public Slot getSlot() {
        return slot;
    }

    public boolean isHalfDay() {
        return halfDay;
    }

    public boolean isOnWeekday() {
        return onWeekday;
    }

    public boolean isOnWeekend() {
        return onWeekend;
    }

    public boolean isEarlyEligible() {
        return earlyEligible;
    }

    public LocalTime getEarlyEndTime() {
        return earlyEndTime;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public boolean isActive() {
        return active;
    }
}
