package com.chamcong.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "tax_code")
    private String taxCode;

    @Column(name = "position_id")
    private Long positionId;

    public Employee() {
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getFullName() {
        return fullName;
    }

    public String getTaxCode() {
        return taxCode;
    }

    public Long getPositionId() {
        return positionId;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setTaxCode(String taxCode) {
        this.taxCode = taxCode;
    }

    public void setPositionId(Long positionId) {
        this.positionId = positionId;
    }
}
