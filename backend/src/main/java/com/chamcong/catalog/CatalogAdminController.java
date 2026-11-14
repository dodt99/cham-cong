package com.chamcong.catalog;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.chamcong.catalog.CatalogAdminDtos.EmployeeDto;
import com.chamcong.catalog.CatalogAdminDtos.EmployeeRequest;
import com.chamcong.catalog.CatalogAdminDtos.LocationDto;
import com.chamcong.catalog.CatalogAdminDtos.LocationRequest;
import com.chamcong.catalog.CatalogAdminDtos.Reference;
import com.chamcong.catalog.CatalogAdminDtos.ShiftDto;
import com.chamcong.catalog.CatalogAdminDtos.ShiftRequest;

/** Quản trị danh mục — chỉ ADMIN (mọi đường dẫn /api/admin/** bị chặn ở SecurityConfig, kể cả GET vì có MST). */
@RestController
@RequestMapping("/api/admin")
class CatalogAdminController {

    private final CatalogAdminService service;

    CatalogAdminController(CatalogAdminService service) {
        this.service = service;
    }

    @GetMapping("/reference")
    Reference reference() {
        return service.reference();
    }

    @GetMapping("/employees")
    List<EmployeeDto> employees() {
        return service.employees();
    }

    @PostMapping("/employees")
    @ResponseStatus(HttpStatus.CREATED)
    EmployeeDto createEmployee(@Valid @RequestBody EmployeeRequest request) {
        return service.createEmployee(request);
    }

    @PutMapping("/employees/{employeeId}")
    EmployeeDto updateEmployee(@PathVariable Long employeeId, @Valid @RequestBody EmployeeRequest request) {
        return service.updateEmployee(employeeId, request);
    }

    @GetMapping("/shifts")
    List<ShiftDto> shifts() {
        return service.shifts();
    }

    @PostMapping("/shifts")
    @ResponseStatus(HttpStatus.CREATED)
    ShiftDto createShift(@Valid @RequestBody ShiftRequest request) {
        return service.createShift(request);
    }

    @PutMapping("/shifts/{id}")
    ShiftDto updateShift(@PathVariable Long id, @Valid @RequestBody ShiftRequest request) {
        return service.updateShift(id, request);
    }

    @GetMapping("/locations")
    List<LocationDto> locations() {
        return service.locations();
    }

    @PostMapping("/locations")
    @ResponseStatus(HttpStatus.CREATED)
    LocationDto createLocation(@Valid @RequestBody LocationRequest request) {
        return service.createLocation(request);
    }

    @PutMapping("/locations/{id}")
    LocationDto updateLocation(@PathVariable Long id, @Valid @RequestBody LocationRequest request) {
        return service.updateLocation(id, request);
    }
}
