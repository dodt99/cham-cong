package com.chamcong.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Tầng / khu in trên file thanh toán. */
@Entity
@Table(name = "block")
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id")
    private Long teamId;

    private String name;

    @Column(name = "sort_order")
    private int sortOrder;

    @Column(name = "evening_sort_order")
    private Integer eveningSortOrder;

    protected Block() {
    }

    public Long getId() {
        return id;
    }

    public Long getTeamId() {
        return teamId;
    }

    public String getName() {
        return name;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public Integer getEveningSortOrder() {
        return eveningSortOrder;
    }
}
