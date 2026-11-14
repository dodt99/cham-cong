package com.chamcong.export;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import com.chamcong.PostgresTestConfig;
import com.chamcong.catalog.Catalog;
import com.chamcong.catalog.Catalog.LocationInfo;
import com.chamcong.catalog.Catalog.MemberInfo;
import com.chamcong.catalog.Catalog.OffTypeInfo;
import com.chamcong.catalog.Catalog.ShiftInfo;
import com.chamcong.catalog.CatalogService;
import com.chamcong.catalog.CurrentTeam;
import com.chamcong.catalog.Slot;
import com.chamcong.schedule.Assignment;
import com.chamcong.schedule.AssignmentRepository;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Bảo đảm "Excel giống v1": mỗi kịch bản trong {@code src/test/resources/golden/<tên>/input.json}
 * (viết theo mô hình dữ liệu v1) được nạp vào database v2, xuất ra 4 file và so từng ô với file
 * do chính code v1 sinh ra ({@code npm run golden} ở gốc repo).
 */
@SpringBootTest
@Import(PostgresTestConfig.class)
class ExportGoldenTest {

    private static final Path GOLDEN_DIR = Path.of("src/test/resources/golden");
    private static final List<String> V1_DAY_KEYS = List.of("mon", "tue", "wed", "thu", "fri", "sat", "sun");
    /** V1 dùng mã giả 2K44 cho "2K43 nghỉ chiều". */
    private static final String V1_HALF_DAY_2K43 = "2K44";

    @Autowired
    private ExportService exportService;
    @Autowired
    private CatalogService catalogService;
    @Autowired
    private CurrentTeam currentTeam;
    @Autowired
    private AssignmentRepository assignments;

    @BeforeEach
    void clearAssignments() {
        assignments.deleteAllInBatch();
    }

    @ParameterizedTest(name = "{0} / {1}")
    @CsvSource({
            "empty, fast", "empty, early", "empty, evening", "empty, weekend",
            "full, fast", "full, early", "full, evening", "full, weekend",
            "rules, fast", "rules, early", "rules, evening", "rules, weekend",
            "month-boundary, fast", "month-boundary, early", "month-boundary, evening", "month-boundary, weekend",
            "year-boundary, fast", "year-boundary, early", "year-boundary, evening", "year-boundary, weekend",
    })
    void exportMatchesV1CellByCell(String scenario, String type) throws IOException {
        LocalDate weekStart = loadScenario(GOLDEN_DIR.resolve(scenario).resolve("input.json"));

        byte[] actual = exportService.render(ExportType.fromSlug(type), weekStart).content();

        byte[] expected = Files.readAllBytes(GOLDEN_DIR.resolve(scenario).resolve(type + ".xlsx"));
        WorkbookAssert.assertSameCells(expected, actual);
    }

    /** Chuyển một kịch bản dạng v1 thành các dòng assignment của v2. */
    private LocalDate loadScenario(Path input) throws IOException {
        JsonNode root;
        try (InputStream in = Files.newInputStream(input)) {
            root = JsonMapper.builder().build().readTree(in);
        }
        LocalDate weekStart = LocalDate.parse(root.get("weekStart").asString());

        Catalog catalog = catalogService.load();
        Map<String, MemberInfo> memberByCode = catalog.members().stream()
                .collect(Collectors.toMap(MemberInfo::code, Function.identity()));
        Map<String, LocationInfo> locationByCode = catalog.locations().stream()
                .collect(Collectors.toMap(LocationInfo::code, Function.identity()));
        Map<String, OffTypeInfo> offTypeByCode = catalog.offTypes().stream()
                .collect(Collectors.toMap(OffTypeInfo::code, Function.identity()));
        ShiftInfo eveningShift = catalog.shifts().stream().filter(s -> s.slot() == Slot.EVENING).findFirst()
                .orElseThrow();
        Long teamId = currentTeam.id();

        for (Map.Entry<String, JsonNode> employee : root.get("rows").properties()) {
            long employeeId = memberByCode.get(employee.getKey()).employeeId();
            for (Map.Entry<String, JsonNode> day : employee.getValue().properties()) {
                LocalDate date = weekStart.plusDays(V1_DAY_KEYS.indexOf(day.getKey()));
                JsonNode entry = day.getValue();
                String shiftCode = text(entry, "shiftCode");
                String offType = text(entry, "offType");
                if (shiftCode != null) {
                    Assignment main = new Assignment(teamId, employeeId, date, Slot.MAIN);
                    main.assignShift(shiftOf(catalog, shiftCode).id(),
                            locationId(locationByCode, text(entry, "locationKey")), null);
                    assignments.save(main);
                } else if (offType != null) {
                    Assignment main = new Assignment(teamId, employeeId, date, Slot.MAIN);
                    main.assignOff(offTypeByCode.get(offType).id(), null);
                    assignments.save(main);
                }
                if (entry.path("extraEvening").asBoolean(false)) {
                    Assignment evening = new Assignment(teamId, employeeId, date, Slot.EVENING);
                    evening.assignShift(eveningShift.id(),
                            locationId(locationByCode, text(entry, "eveningLocationKey")), null);
                    assignments.save(evening);
                }
            }
        }
        return weekStart;
    }

    private static ShiftInfo shiftOf(Catalog catalog, String v1Code) {
        boolean halfDay2K43 = V1_HALF_DAY_2K43.equals(v1Code);
        String code = halfDay2K43 ? "2K43" : v1Code;
        List<ShiftInfo> matches = catalog.shifts().stream().filter(s -> s.code().equals(code)).toList();
        ShiftInfo shift = matches.size() == 1 ? matches.get(0)
                : matches.stream().filter(s -> s.halfDay() == halfDay2K43).findFirst().orElseThrow();
        assertThat(shift).as("shift %s", v1Code).isNotNull();
        return shift;
    }

    /** Khoá địa điểm v1 có dạng "NORMAL-K1.1TD" / "EVENING-…" / "WEEKEND-…". */
    private static Long locationId(Map<String, LocationInfo> locationByCode, String v1Key) {
        if (v1Key == null) {
            return null;
        }
        return locationByCode.get(v1Key.substring(v1Key.indexOf('-') + 1)).id();
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asString();
    }
}
