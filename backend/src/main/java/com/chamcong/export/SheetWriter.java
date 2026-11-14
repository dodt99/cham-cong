package com.chamcong.export;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;

/**
 * Ghi giá trị vào một sheet của template, giữ nguyên định dạng sẵn có của ô.
 * Toạ độ dòng / cột tính từ 1, giống cách đánh số trong spec.
 */
final class SheetWriter {

    static final String DATE_FORMAT = "dd/mm/yyyy";
    static final String TIME_FORMAT = "hh:mm";

    private final Workbook workbook;
    private final Sheet sheet;
    private final Map<String, CellStyle> derivedStyles = new HashMap<>();

    SheetWriter(Workbook workbook, Sheet sheet) {
        this.workbook = workbook;
        this.sheet = sheet;
    }

    void text(int row, int column, String value) {
        if (value != null) {
            cell(row, column).setCellValue(value);
        }
    }

    /** Ngày dạng số serial của Excel + định dạng dd/mm/yyyy. */
    void date(int row, int column, LocalDate value) {
        Cell cell = cell(row, column);
        cell.setCellValue(DateUtil.getExcelDate(value));
        applyFormat(cell, DATE_FORMAT);
    }

    /** Giờ dạng phần thập phân của ngày + định dạng hh:mm. */
    void time(int row, int column, LocalTime value) {
        if (value == null) {
            return;
        }
        Cell cell = cell(row, column);
        cell.setCellValue((value.getHour() * 60 + value.getMinute()) / (24.0 * 60));
        applyFormat(cell, TIME_FORMAT);
    }

    void solidFill(int row, int column, String argb) {
        Cell cell = cell(row, column);
        CellStyle base = cell.getCellStyle();
        cell.setCellStyle(derivedStyles.computeIfAbsent(base.getIndex() + "|fill|" + argb, key -> {
            XSSFCellStyle style = (XSSFCellStyle) workbook.createCellStyle();
            style.cloneStyleFrom(base);
            style.setFillForegroundColor(new XSSFColor(hexToBytes(argb), null));
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            return style;
        }));
    }

    /**
     * Đặt number format cho ô theo đúng cách v1 (ExcelJS) vẫn làm: ô đã có style riêng trong template thì
     * sửa thẳng vào style đó, nên mọi ô dùng chung style cũng đổi theo (ví dụ các ô giờ còn trống phía dưới
     * chuyển từ {@code hh":"mm} sang {@code hh:mm} — hiển thị y hệt). Ô dùng style mặc định thì nhận style mới
     * để không ảnh hưởng cả sheet.
     */
    private void applyFormat(Cell cell, String format) {
        CellStyle current = cell.getCellStyle();
        short formatId = workbook.createDataFormat().getFormat(format);
        if (current.getIndex() != 0) {
            current.setDataFormat(formatId);
            return;
        }
        cell.setCellStyle(derivedStyles.computeIfAbsent("default|format|" + format, key -> {
            CellStyle style = workbook.createCellStyle();
            style.setDataFormat(formatId);
            return style;
        }));
    }

    /** Ô mới tạo thừa hưởng định dạng của dòng, rồi của cột — như Excel hiển thị ô trống. */
    private Cell cell(int rowNumber, int columnNumber) {
        Row row = sheet.getRow(rowNumber - 1);
        if (row == null) {
            row = sheet.createRow(rowNumber - 1);
        }
        Cell cell = row.getCell(columnNumber - 1);
        if (cell == null) {
            cell = row.createCell(columnNumber - 1);
            CellStyle inherited = row.getRowStyle() != null ? row.getRowStyle()
                    : sheet.getColumnStyle(columnNumber - 1);
            if (inherited != null) {
                cell.setCellStyle(inherited);
            }
        }
        return cell;
    }

    private static byte[] hexToBytes(String argb) {
        byte[] bytes = new byte[argb.length() / 2];
        for (int i = 0; i < bytes.length; i++) {
            bytes[i] = (byte) Integer.parseInt(argb.substring(2 * i, 2 * i + 2), 16);
        }
        return bytes;
    }
}
