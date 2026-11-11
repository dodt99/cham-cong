package com.chamcong.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Địa điểm làm việc; ba cờ on_* cho biết dùng được ở ngày thường / ca tối / T7-CN. */
@Entity
@Table(name = "location")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id")
    private Long teamId;

    @Column(name = "site_id")
    private Long siteId;

    @Column(name = "block_id")
    private Long blockId;

    private String code;

    private String name;

    @Column(name = "on_weekday")
    private boolean onWeekday;

    @Column(name = "on_evening")
    private boolean onEvening;

    @Column(name = "on_weekend")
    private boolean onWeekend;

    @Column(name = "sort_order")
    private int sortOrder;

    private boolean active;

    protected Location() {
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

    public Long getBlockId() {
        return blockId;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public boolean isOnWeekday() {
        return onWeekday;
    }

    public boolean isOnEvening() {
        return onEvening;
    }

    public boolean isOnWeekend() {
        return onWeekend;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public boolean isActive() {
        return active;
    }
}
