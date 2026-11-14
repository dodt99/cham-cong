package com.chamcong.export;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.chamcong.export.WeekExport.PreviewSheet;

@Service
public class ExportService {

    public record Preview(String fileName, List<PreviewSheet> sheets) {
    }

    public record ExportFile(String fileName, byte[] content) {
    }

    private final WeekScheduleReader reader;
    private final Map<ExportType, WeekExport> exports = new EnumMap<>(ExportType.class);

    ExportService(WeekScheduleReader reader, List<WeekExport> exports) {
        this.reader = reader;
        exports.forEach(export -> this.exports.put(export.type(), export));
    }

    public Preview preview(ExportType type, LocalDate weekStart) {
        WeekSchedule schedule = reader.read(weekStart);
        return new Preview(type.fileName(weekStart), exports.get(type).preview(schedule));
    }

    public ExportFile render(ExportType type, LocalDate weekStart) {
        WeekSchedule schedule = reader.read(weekStart);
        try (InputStream template = new ClassPathResource(type.templateResource()).getInputStream();
                XSSFWorkbook workbook = new XSSFWorkbook(template);
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            exports.get(type).fill(workbook, schedule);
            workbook.write(out);
            return new ExportFile(type.fileName(weekStart), out.toByteArray());
        } catch (IOException e) {
            throw new UncheckedIOException("Không đọc được file mẫu " + type.templateResource(), e);
        }
    }
}
