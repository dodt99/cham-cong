package com.chamcong.export;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * So hai workbook từng ô trên mọi sheet: giá trị, kiểu dữ liệu, number format và màu nền.
 * Ô không tồn tại và ô trống không định dạng được coi là như nhau.
 */
final class WorkbookAssert {

    private WorkbookAssert() {
    }

    static void assertSameCells(byte[] expected, byte[] actual) throws IOException {
        try (XSSFWorkbook want = new XSSFWorkbook(new ByteArrayInputStream(expected));
                XSSFWorkbook got = new XSSFWorkbook(new ByteArrayInputStream(actual))) {
            assertThat(sheetNames(got)).as("sheet names").isEqualTo(sheetNames(want));
            List<String> differences = new ArrayList<>();
            for (int s = 0; s < want.getNumberOfSheets(); s++) {
                Sheet wantSheet = want.getSheetAt(s);
                Sheet gotSheet = got.getSheetAt(s);
                int lastRow = Math.max(wantSheet.getLastRowNum(), gotSheet.getLastRowNum());
                for (int r = 0; r <= lastRow; r++) {
                    Row wantRow = wantSheet.getRow(r);
                    Row gotRow = gotSheet.getRow(r);
                    int lastCell = Math.max(lastCellNum(wantRow), lastCellNum(gotRow));
                    for (int c = 0; c < lastCell; c++) {
                        String wantCell = describe(wantRow == null ? null : wantRow.getCell(c));
                        String gotCell = describe(gotRow == null ? null : gotRow.getCell(c));
                        if (!wantCell.equals(gotCell)) {
                            differences.add("%s!%s expected <%s> but was <%s>".formatted(wantSheet.getSheetName(),
                                    new CellReference(r, c).formatAsString(), wantCell, gotCell));
                        }
                    }
                }
            }
            assertThat(differences).as("cell differences").isEmpty();
        }
    }

    private static List<String> sheetNames(XSSFWorkbook workbook) {
        List<String> names = new ArrayList<>();
        for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
            names.add(workbook.getSheetName(i));
        }
        return names;
    }

    private static int lastCellNum(Row row) {
        return row == null ? 0 : Math.max(row.getLastCellNum(), 0);
    }

    private static String describe(Cell cell) {
        if (cell == null) {
            return "empty";
        }
        String value = switch (cell.getCellType()) {
            case STRING -> "text:" + cell.getStringCellValue();
            case NUMERIC -> "number:" + Math.round(cell.getNumericCellValue() * 1e9) / 1e9;
            case BOOLEAN -> "boolean:" + cell.getBooleanCellValue();
            case FORMULA -> "formula:" + cell.getCellFormula();
            case ERROR -> "error:" + cell.getErrorCellValue();
            default -> "empty";
        };
        XSSFCellStyle style = (XSSFCellStyle) cell.getCellStyle();
        String format = style.getDataFormatString();
        String fill = style.getFillPattern() == FillPatternType.NO_FILL ? null : argb(style.getFillForegroundXSSFColor());
        boolean plain = (format == null || "General".equals(format)) && fill == null;
        if (cell.getCellType() == CellType.BLANK && plain) {
            return "empty";
        }
        return value + (plain ? "" : " [format=" + format + ", fill=" + fill + "]");
    }

    private static String argb(XSSFColor color) {
        return color == null ? "auto" : String.valueOf(color.getARGBHex());
    }
}
