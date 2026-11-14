package com.chamcong.export;

import java.util.Arrays;

import com.chamcong.common.ApiException;

public enum ExportType {
    FAST("fast", "Ca-lam-viec"),
    EARLY("early", "Lam-som"),
    EVENING("evening", "Lam-toi"),
    WEEKEND("weekend", "T7-CN");

    private final String slug;
    private final String filePrefix;

    ExportType(String slug, String filePrefix) {
        this.slug = slug;
        this.filePrefix = filePrefix;
    }

    public String slug() {
        return slug;
    }

    public String fileName(java.time.LocalDate weekStart) {
        return filePrefix + "-" + weekStart + ".xlsx";
    }

    public String templateResource() {
        return "excel-templates/" + slug + ".xlsx";
    }

    public static ExportType fromSlug(String slug) {
        return Arrays.stream(values()).filter(t -> t.slug.equals(slug)).findFirst()
                .orElseThrow(() -> ApiException.notFound("EXPORT_TYPE_UNKNOWN", "Không có loại file xuất này."));
    }
}
