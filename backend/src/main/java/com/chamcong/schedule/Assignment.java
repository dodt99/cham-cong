package com.chamcong.schedule;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import com.chamcong.catalog.Slot;

/**
 * Một phân công: nhân viên × ngày × khe → ca (kèm địa điểm) hoặc loại nghỉ.
 * Các ràng buộc "đúng một trong ca / nghỉ" và "nghỉ thì không có địa điểm" do database giữ.
 */
@Entity
@Table(name = "assignment")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id", nullable = false, updatable = false)
    private Long teamId;

    @Column(name = "employee_id", nullable = false, updatable = false)
    private Long employeeId;

    @Column(name = "work_date", nullable = false, updatable = false)
    private LocalDate workDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private Slot slot;

    @Column(name = "shift_id")
    private Long shiftId;

    @Column(name = "off_type_id")
    private Long offTypeId;

    @Column(name = "location_id")
    private Long locationId;

    @Version
    private int version;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "updated_by")
    private Long updatedBy;

    protected Assignment() {
    }

    public Assignment(Long teamId, Long employeeId, LocalDate workDate, Slot slot) {
        this.teamId = teamId;
        this.employeeId = employeeId;
        this.workDate = workDate;
        this.slot = slot;
    }

    /** Gán ca làm việc (xoá loại nghỉ nếu có). */
    public void assignShift(Long shiftId, Long locationId, Long userId) {
        this.shiftId = shiftId;
        this.offTypeId = null;
        this.locationId = locationId;
        touch(userId);
    }

    /** Gán nghỉ (xoá ca và địa điểm). */
    public void assignOff(Long offTypeId, Long userId) {
        this.shiftId = null;
        this.offTypeId = offTypeId;
        this.locationId = null;
        touch(userId);
    }

    private void touch(Long userId) {
        this.updatedAt = Instant.now();
        this.updatedBy = userId;
    }

    public Long getId() {
        return id;
    }

    public Long getTeamId() {
        return teamId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public Slot getSlot() {
        return slot;
    }

    public Long getShiftId() {
        return shiftId;
    }

    public Long getOffTypeId() {
        return offTypeId;
    }

    public Long getLocationId() {
        return locationId;
    }

    public int getVersion() {
        return version;
    }
}
