package com.chamcong.export;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Component;

import com.chamcong.common.Weeks;
import com.chamcong.export.AllowanceRows.AllowanceRow;

/** File T7-CN — spec mục 7.4. Hai sheet "T7" và "CN", tiêu đề ngày ở A1, dữ liệu từ dòng 4. */
@Component
class WeekendExport implements WeekExport {

    private static final List<String> SHEET_NAMES = List.of("T7", "CN");
    private static final List<String> TITLE_PREFIXES =
            List.of("KHÁM CHỮA BỆNH THỨ 7 NGÀY ", "KHÁM CHỮA BỆNH CHỦ NHẬT NGÀY ");
    private static final int HEADER_ROW = 1;
    private static final int DATA_START_ROW = 4;
    private static final String JOB_TITLE = "HDV";
    private static final String JOB_DESCRIPTION = "HDNB";

    @Override
    public ExportType type() {
        return ExportType.WEEKEND;
    }

    static String title(int dayIndex, LocalDate date) {
        return TITLE_PREFIXES.get(dayIndex) + Formats.dateShortMonth(date);
    }

    @Override
    public List<PreviewSheet> preview(WeekSchedule schedule) {
        List<LocalDate> days = Weeks.weekend(schedule.weekStart());
        List<PreviewSheet> sheets = new ArrayList<>();
        for (int i = 0; i < days.size(); i++) {
            List<List<String>> rows = AllowanceRows.weekendDay(schedule, days.get(i)).stream()
                    .map(r -> List.of(r.employeeCode(), r.fullName(), JOB_TITLE, Formats.time(r.start()),
                            Formats.time(r.end()), JOB_DESCRIPTION, Formats.orEmpty(r.block()), r.taxCode(),
                            schedule.unitName()))
                    .toList();
            sheets.add(new PreviewSheet(SHEET_NAMES.get(i), title(i, days.get(i)),
                    List.of("Mã NV", "Họ và tên", "Chức danh", "Bắt đầu", "Kết thúc", "Công việc", "Địa điểm",
                            "MST", "Đơn vị"),
                    rows));
        }
        return sheets;
    }

    @Override
    public void fill(Workbook workbook, WeekSchedule schedule) {
        List<LocalDate> days = Weeks.weekend(schedule.weekStart());
        for (int i = 0; i < days.size(); i++) {
            SheetWriter sheet = new SheetWriter(workbook, workbook.getSheet(SHEET_NAMES.get(i)));
            sheet.text(HEADER_ROW, 1, title(i, days.get(i)));
            int rowNumber = DATA_START_ROW;
            for (AllowanceRow row : AllowanceRows.weekendDay(schedule, days.get(i))) {
                sheet.text(rowNumber, 2, row.employeeCode());
                sheet.text(rowNumber, 3, row.fullName());
                sheet.text(rowNumber, 4, JOB_TITLE);
                sheet.time(rowNumber, 7, row.start());
                sheet.time(rowNumber, 8, row.end());
                sheet.text(rowNumber, 9, JOB_DESCRIPTION);
                sheet.text(rowNumber, 10, row.block());
                sheet.text(rowNumber, 11, row.taxCode());
                sheet.text(rowNumber, 12, schedule.unitName());
                rowNumber++;
            }
        }
    }
}
