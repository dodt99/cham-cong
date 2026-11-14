package com.chamcong.export;

import java.time.LocalDate;
import java.util.List;

import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Component;

import com.chamcong.export.AllowanceRows.AllowanceRow;

/** File Làm tối — spec mục 7.3. Sheet "Sheet1", tiêu đề tuần ở D3, dữ liệu từ dòng 6. */
@Component
class EveningExport implements WeekExport {

    private static final String SHEET_NAME = "Sheet1";
    private static final int HEADER_ROW = 3;
    private static final int HEADER_COLUMN = 4;
    private static final int DATA_START_ROW = 6;
    private static final String JOB_TITLE = "HDV";
    private static final String JOB_DESCRIPTION = "Hướng dẫn";

    @Override
    public ExportType type() {
        return ExportType.EVENING;
    }

    static String header(LocalDate weekStart) {
        return "TỪ " + Formats.date(weekStart) + " ĐẾN " + Formats.date(weekStart.plusDays(4));
    }

    @Override
    public List<PreviewSheet> preview(WeekSchedule schedule) {
        List<List<String>> rows = AllowanceRows.evening(schedule).stream()
                .map(r -> List.of(Formats.date(r.workDate()), r.employeeCode(), r.fullName(), JOB_TITLE,
                        Formats.time(r.start()), Formats.time(r.end()), JOB_DESCRIPTION,
                        Formats.orEmpty(r.block()), r.taxCode(), schedule.unitName()))
                .toList();
        return List.of(new PreviewSheet(SHEET_NAME, header(schedule.weekStart()),
                List.of("Ngày làm", "Mã NV", "Họ và tên", "Chức danh", "Bắt đầu", "Kết thúc", "Công việc",
                        "Địa điểm", "MST", "Đơn vị"),
                rows));
    }

    @Override
    public void fill(Workbook workbook, WeekSchedule schedule) {
        SheetWriter sheet = new SheetWriter(workbook, workbook.getSheet(SHEET_NAME));
        sheet.text(HEADER_ROW, HEADER_COLUMN, header(schedule.weekStart()));
        int rowNumber = DATA_START_ROW;
        for (AllowanceRow row : AllowanceRows.evening(schedule)) {
            sheet.text(rowNumber, 2, row.employeeCode());
            sheet.text(rowNumber, 3, row.fullName());
            sheet.date(rowNumber, 4, row.workDate());
            sheet.text(rowNumber, 5, JOB_TITLE);
            sheet.time(rowNumber, 8, row.start());
            sheet.time(rowNumber, 9, row.end());
            sheet.text(rowNumber, 10, JOB_DESCRIPTION);
            sheet.text(rowNumber, 11, row.block());
            sheet.text(rowNumber, 12, row.taxCode());
            sheet.text(rowNumber, 13, schedule.unitName());
            rowNumber++;
        }
    }
}
