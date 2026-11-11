package com.chamcong.export;

import java.time.LocalDate;
import java.util.List;

import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Component;

import com.chamcong.export.AllowanceRows.AllowanceRow;

/** File Làm sớm — spec mục 7.2. Sheet đầu tiên, tiêu đề tuần ở A3, dữ liệu từ dòng 6. */
@Component
class EarlyExport implements WeekExport {

    private static final int HEADER_ROW = 3;
    private static final int DATA_START_ROW = 6;

    @Override
    public ExportType type() {
        return ExportType.EARLY;
    }

    /**
     * "NGÀY 04-08/5/2026": ngày T2 và T6, tháng và năm lấy theo T6.
     * Giữ đúng như v1, kể cả khi tuần vắt sang tháng mới ("NGÀY 27-01/5/2026").
     */
    static String header(LocalDate weekStart) {
        LocalDate friday = weekStart.plusDays(4);
        return "NGÀY %02d-%02d/%d/%d".formatted(weekStart.getDayOfMonth(), friday.getDayOfMonth(),
                friday.getMonthValue(), friday.getYear());
    }

    @Override
    public List<PreviewSheet> preview(WeekSchedule schedule) {
        List<List<String>> rows = AllowanceRows.early(schedule).stream()
                .map(r -> List.of(r.employeeCode(), r.fullName(), r.jobTitle(), Formats.date(r.workDate()),
                        Formats.time(r.start()), Formats.time(r.end()), r.jobDescription(),
                        Formats.orEmpty(r.block()), r.taxCode(), Formats.orEmpty(r.note())))
                .toList();
        return List.of(new PreviewSheet("Làm sớm", header(schedule.weekStart()),
                List.of("Mã NV", "Họ và tên", "Chức danh", "Ngày làm", "Bắt đầu ca", "Kết thúc ca", "Công việc",
                        "Địa điểm", "MST", "Ghi chú"),
                rows));
    }

    @Override
    public void fill(Workbook workbook, WeekSchedule schedule) {
        SheetWriter sheet = new SheetWriter(workbook, workbook.getSheetAt(0));
        sheet.text(HEADER_ROW, 1, header(schedule.weekStart()));
        int rowNumber = DATA_START_ROW;
        for (AllowanceRow row : AllowanceRows.early(schedule)) {
            sheet.text(rowNumber, 2, row.employeeCode());
            sheet.text(rowNumber, 3, row.fullName());
            sheet.date(rowNumber, 4, row.workDate());
            sheet.text(rowNumber, 5, row.jobTitle());
            sheet.time(rowNumber, 8, row.start());
            sheet.time(rowNumber, 9, row.end());
            sheet.text(rowNumber, 12, row.jobDescription());
            sheet.text(rowNumber, 13, row.block());
            sheet.text(rowNumber, 14, row.taxCode());
            // Cột 15 "Tên đơn vị" để trống như v1.
            sheet.text(rowNumber, 16, row.note());
            rowNumber++;
        }
    }
}
