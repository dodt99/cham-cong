package com.chamcong.export;

import java.util.List;

import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Component;

import com.chamcong.export.FastRows.FastRow;

/** File Fast "Đăng ký công việc" — spec mục 7.1. Sheet đầu tiên, dữ liệu từ dòng 4. */
@Component
class FastExport implements WeekExport {

    private static final int DATA_START_ROW = 4;
    private static final String JOB_CODE = "K006";
    /** rgb(207, 226, 243) — nền ô ngày của dòng T7 / CN. */
    private static final String WEEKEND_DATE_FILL = "FFCFE2F3";

    private static final int COL_EMPLOYEE_CODE = 1;
    private static final int COL_FULL_NAME = 2;
    private static final int COL_FROM_DATE = 3;
    private static final int COL_TO_DATE = 4;
    private static final int COL_SHIFT = 5;
    private static final int COL_JOB_CODE = 7;
    private static final int COL_LOCATION_CODE = 9;
    private static final int COL_NOTE = 10;

    @Override
    public ExportType type() {
        return ExportType.FAST;
    }

    @Override
    public List<PreviewSheet> preview(WeekSchedule schedule) {
        List<List<String>> rows = FastRows.build(schedule).stream()
                .map(r -> List.of(r.employeeCode(), r.fullName(), Formats.date(r.fromDate()),
                        Formats.date(r.toDate()), r.shiftLabel(), jobCode(r), Formats.orEmpty(r.locationCode()),
                        Formats.orEmpty(r.note())))
                .toList();
        return List.of(new PreviewSheet("HDV", null,
                List.of("Mã NV", "Họ và tên", "Từ ngày", "Đến ngày", "Ca làm việc", "Mã công việc", "Mã địa điểm",
                        "Ghi chú"),
                rows));
    }

    @Override
    public void fill(Workbook workbook, WeekSchedule schedule) {
        SheetWriter sheet = new SheetWriter(workbook, workbook.getSheetAt(0));
        int rowNumber = DATA_START_ROW;
        for (FastRow row : FastRows.build(schedule)) {
            sheet.text(rowNumber, COL_EMPLOYEE_CODE, row.employeeCode());
            sheet.text(rowNumber, COL_FULL_NAME, row.fullName());
            // File Fast nhận ngày dạng chuỗi dd/MM/yyyy.
            sheet.text(rowNumber, COL_FROM_DATE, Formats.date(row.fromDate()));
            sheet.text(rowNumber, COL_TO_DATE, Formats.date(row.toDate()));
            sheet.text(rowNumber, COL_SHIFT, row.shiftLabel());
            if (row.kind() != FastRows.Kind.OFF) {
                sheet.text(rowNumber, COL_JOB_CODE, JOB_CODE);
            }
            sheet.text(rowNumber, COL_LOCATION_CODE, row.locationCode());
            sheet.text(rowNumber, COL_NOTE, row.note());
            if (row.isSingleWeekendDay()) {
                sheet.solidFill(rowNumber, COL_FROM_DATE, WEEKEND_DATE_FILL);
                sheet.solidFill(rowNumber, COL_TO_DATE, WEEKEND_DATE_FILL);
            }
            rowNumber++;
        }
    }

    private static String jobCode(FastRow row) {
        return row.kind() == FastRows.Kind.OFF ? "" : JOB_CODE;
    }
}
