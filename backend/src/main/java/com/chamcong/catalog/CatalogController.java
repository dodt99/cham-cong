package com.chamcong.catalog;

import java.time.LocalTime;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog")
class CatalogController {

    record SiteDto(long id, String code, String name) {
    }

    record BlockDto(long id, String name) {
    }

    record LocationDto(long id, String code, String name, long siteId, long blockId, boolean onWeekday,
            boolean onEvening, boolean onWeekend, boolean active) {
    }

    record ShiftDto(long id, String code, LocalTime startTime, LocalTime endTime, Slot slot, boolean halfDay,
            boolean onWeekday, boolean onWeekend, Long siteId, boolean active) {
    }

    record OffTypeDto(long id, String code, String label, boolean isDefault) {
    }

    /** Danh mục cần cho màn hình xếp ca; các danh sách đã theo thứ tự hiển thị. */
    record CatalogDto(List<SiteDto> sites, List<BlockDto> blocks, List<LocationDto> locations,
            List<ShiftDto> shifts, List<OffTypeDto> offTypes) {
    }

    private final CatalogService catalogService;

    CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    CatalogDto get() {
        Catalog catalog = catalogService.load();
        return new CatalogDto(
                catalog.sites().stream().map(s -> new SiteDto(s.id(), s.code(), s.name())).toList(),
                catalog.blocks().stream().map(b -> new BlockDto(b.id(), b.name())).toList(),
                catalog.locations().stream()
                        .map(l -> new LocationDto(l.id(), l.code(), l.name(), l.site().id(), l.block().id(),
                                l.onWeekday(), l.onEvening(), l.onWeekend(), l.active()))
                        .toList(),
                catalog.shifts().stream()
                        .map(s -> new ShiftDto(s.id(), s.code(), s.startTime(), s.endTime(), s.slot(), s.halfDay(),
                                s.onWeekday(), s.onWeekend(), s.siteId(), s.active()))
                        .toList(),
                catalog.offTypes().stream()
                        .map(o -> new OffTypeDto(o.id(), o.code(), o.label(), o.isDefault()))
                        .toList());
    }
}
