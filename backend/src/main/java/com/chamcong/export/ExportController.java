package com.chamcong.export;

import java.time.LocalDate;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chamcong.export.ExportService.ExportFile;
import com.chamcong.export.ExportService.Preview;

@RestController
@RequestMapping("/api/exports/{type}")
class ExportController {

    private static final MediaType XLSX = MediaType
            .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final ExportService exportService;

    ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/preview")
    Preview preview(@PathVariable String type, @RequestParam LocalDate weekStart) {
        return exportService.preview(ExportType.fromSlug(type), weekStart);
    }

    @GetMapping("/file")
    ResponseEntity<byte[]> file(@PathVariable String type, @RequestParam LocalDate weekStart) {
        ExportFile file = exportService.render(ExportType.fromSlug(type), weekStart);
        return ResponseEntity.ok()
                .contentType(XLSX)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.fileName()).build().toString())
                .body(file.content());
    }
}
