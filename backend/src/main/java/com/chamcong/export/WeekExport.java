package com.chamcong.export;

import java.util.List;

import org.apache.poi.ss.usermodel.Workbook;

/**
 * Một loại file xuất theo tuần: biết dựng bảng xem trước và điền template của mình.
 * Thêm loại file mới = thêm một implementation + một template + một giá trị {@link ExportType}.
 */
interface WeekExport {

    ExportType type();

    /** Bảng xem trước — cùng danh sách dòng với {@link #fill}. */
    List<PreviewSheet> preview(WeekSchedule schedule);

    /** Điền dữ liệu vào workbook đã mở từ template. */
    void fill(Workbook workbook, WeekSchedule schedule);

    record PreviewSheet(String name, String title, List<String> columns, List<List<String>> rows) {
    }
}
