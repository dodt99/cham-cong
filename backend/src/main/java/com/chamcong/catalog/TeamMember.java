package com.chamcong.catalog;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Nhân viên thuộc một đội, kèm thứ tự hiển thị và thời gian hiệu lực. */
@Entity
@Table(name = "team_member")
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id")
    private Long teamId;

    @Column(name = "employee_id")
    private Long employeeId;

    @Enumerated(EnumType.STRING)
    private Membership membership;

    @Column(name = "sort_order")
    private int sortOrder;

    @Column(name = "active_from")
    private LocalDate activeFrom;

    @Column(name = "active_to")
    private LocalDate activeTo;

    public TeamMember() {
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

    public Membership getMembership() {
        return membership;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public LocalDate getActiveFrom() {
        return activeFrom;
    }

    public LocalDate getActiveTo() {
        return activeTo;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public void setMembership(Membership membership) {
        this.membership = membership;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public void setActiveFrom(LocalDate activeFrom) {
        this.activeFrom = activeFrom;
    }

    public void setActiveTo(LocalDate activeTo) {
        this.activeTo = activeTo;
    }
}
