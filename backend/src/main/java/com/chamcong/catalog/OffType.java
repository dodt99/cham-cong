package com.chamcong.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Loại nghỉ. */
@Entity
@Table(name = "off_type")
public class OffType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id")
    private Long teamId;

    private String code;

    private String label;

    @Column(name = "fast_note")
    private String fastNote;

    @Column(name = "is_default")
    private boolean isDefault;

    @Column(name = "sort_order")
    private int sortOrder;

    protected OffType() {
    }

    public Long getId() {
        return id;
    }

    public Long getTeamId() {
        return teamId;
    }

    public String getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public String getFastNote() {
        return fastNote;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public int getSortOrder() {
        return sortOrder;
    }
}
