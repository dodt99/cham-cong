package com.chamcong.schedule;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.chamcong.PostgresTestConfig;
import com.chamcong.auth.AppUser;
import com.chamcong.auth.AppUserRepository;
import com.chamcong.auth.Role;
import com.chamcong.catalog.Catalog;
import com.chamcong.catalog.Catalog.LocationInfo;
import com.chamcong.catalog.Catalog.MemberInfo;
import com.chamcong.catalog.Catalog.OffTypeInfo;
import com.chamcong.catalog.CatalogService;
import com.chamcong.catalog.Slot;

/** Đăng nhập, phân quyền và quy tắc nhập liệu, đi qua HTTP thật (MockMvc) với Postgres thật. */
@SpringBootTest
@AutoConfigureMockMvc
@Import(PostgresTestConfig.class)
class ScheduleApiTest {

    private static final String MONDAY = "2026-05-04";
    private static final String SATURDAY = "2026-05-09";
    private static final String PASSWORD = "mat-khau-thu-nghiem";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private AppUserRepository users;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AssignmentRepository assignments;
    @Autowired
    private CatalogService catalogService;

    private long coreEmployee;
    private long supportEmployee;
    private Map<String, LocationInfo> locations;
    private Map<String, OffTypeInfo> offTypes;
    private Catalog catalog;

    @BeforeEach
    void setUp() {
        assignments.deleteAllInBatch();
        users.deleteAllInBatch();
        for (Role role : Role.values()) {
            users.save(new AppUser(role.name().toLowerCase(), passwordEncoder.encode(PASSWORD), role.name(), role));
        }
        catalog = catalogService.load();
        Map<String, MemberInfo> members = catalog.members().stream()
                .collect(Collectors.toMap(MemberInfo::code, Function.identity()));
        coreEmployee = members.get("24662").employeeId();
        supportEmployee = members.get("19435").employeeId();
        locations = catalog.locations().stream().collect(Collectors.toMap(LocationInfo::code, Function.identity()));
        offTypes = catalog.offTypes().stream().collect(Collectors.toMap(OffTypeInfo::code, Function.identity()));
    }

    // ---- đăng nhập & phân quyền ---------------------------------------------------------------

    @Test
    void loginCreatesSessionAndRejectsWrongPassword() throws Exception {
        mvc.perform(get("/api/schedule").param("weekStart", MONDAY)).andExpect(status().isUnauthorized());

        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"editor\",\"password\":\"sai\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));

        Cookie session = login("editor");
        mvc.perform(get("/api/auth/me").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("editor"))
                .andExpect(jsonPath("$.role").value("EDITOR"));

        mvc.perform(post("/api/auth/logout").cookie(session).with(csrf())).andExpect(status().isNoContent());
        mvc.perform(get("/api/auth/me").cookie(session)).andExpect(status().isUnauthorized());
    }

    @Test
    void writesNeedCsrfTokenAndEditorRole() throws Exception {
        String body = cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K07", false), null, null, null);

        mvc.perform(put("/api/assignments").cookie(login("editor")).contentType(MediaType.APPLICATION_JSON)
                .content(body)).andExpect(status().isForbidden());
        mvc.perform(put("/api/assignments").cookie(login("viewer")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isForbidden());
        mvc.perform(get("/api/schedule").cookie(login("viewer")).param("weekStart", MONDAY))
                .andExpect(status().isOk());

        mvc.perform(get("/api/users").cookie(login("editor"))).andExpect(status().isForbidden());
        mvc.perform(get("/api/users").cookie(login("admin")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void lockingOrDowngradingAnAccountAppliesToOpenSessions() throws Exception {
        Cookie admin = login("admin");
        Cookie editor = login("editor");
        long editorId = users.findByUsername("editor").orElseThrow().getId();
        String account = "{\"fullName\":\"EDITOR\",\"role\":\"%s\",\"active\":%s}";

        putCell(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K07", false), null, null, null))
                .andExpect(status().isOk());

        // Hạ quyền: phiên đang mở mất quyền ghi ngay, vẫn xem được.
        mvc.perform(put("/api/users/" + editorId).cookie(admin).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(account.formatted("VIEWER", true))).andExpect(status().isOk());
        putCell(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K04", false), null, null, 0))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/schedule").cookie(editor).param("weekStart", MONDAY)).andExpect(status().isOk());

        // Nâng quyền lại cũng có hiệu lực mà không cần đăng nhập lại.
        mvc.perform(put("/api/users/" + editorId).cookie(admin).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(account.formatted("EDITOR", true))).andExpect(status().isOk());
        putCell(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K04", false), null, null, 0))
                .andExpect(status().isOk());

        // Khoá tài khoản: phiên đang mở bị huỷ, không đọc, không ghi, không đăng nhập lại được.
        mvc.perform(put("/api/users/" + editorId).cookie(admin).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(account.formatted("EDITOR", false))).andExpect(status().isOk());
        mvc.perform(get("/api/schedule").cookie(editor).param("weekStart", MONDAY))
                .andExpect(status().isUnauthorized());
        putCell(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K07", false), null, null, 1))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/exports/fast/file").cookie(editor).param("weekStart", MONDAY))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"editor\",\"password\":\"%s\"}".formatted(PASSWORD)))
                .andExpect(status().isUnauthorized());
        assertThat(mainShiftOn(MONDAY)).isEqualTo(shiftId("K04", false));
    }

    // ---- lưu từng ô ---------------------------------------------------------------------------

    @Test
    void savingACellDetectsConcurrentChanges() throws Exception {
        Cookie editor = login("editor");
        Long tang1 = locations.get("K1.1TD").id();

        putCell(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K07", false), null, tang1, null))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(0));

        // Người thứ hai vẫn tưởng ô trống → bị từ chối, nhận lại giá trị hiện tại.
        putCell(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K02", false), null, tang1, null))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("VERSION_CONFLICT"))
                .andExpect(jsonPath("$.details.shiftId").value(shiftId("K07", false)));

        putCell(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K02", false), null, tang1, 0))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1));

        mvc.perform(get("/api/schedule").cookie(editor).param("weekStart", MONDAY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.days.length()").value(7))
                .andExpect(jsonPath("$.members.length()").value(47))
                .andExpect(jsonPath("$.assignments.length()").value(1))
                .andExpect(jsonPath("$.assignments[0].shiftId").value(shiftId("K02", false)));

        mvc.perform(delete("/api/assignments").cookie(editor).with(csrf())
                        .param("employeeId", String.valueOf(coreEmployee)).param("date", MONDAY)
                        .param("slot", "MAIN").param("version", "0"))
                .andExpect(status().isConflict());
        mvc.perform(delete("/api/assignments").cookie(editor).with(csrf())
                        .param("employeeId", String.valueOf(coreEmployee)).param("date", MONDAY)
                        .param("slot", "MAIN").param("version", "1"))
                .andExpect(status().isNoContent());
        assertThat(assignments.count()).isZero();
    }

    @Test
    void choosingOffClearsTheLocation() throws Exception {
        Cookie editor = login("editor");
        Long tang1 = locations.get("K1.1TD").id();
        putCell(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K07", false), null, tang1, null))
                .andExpect(status().isOk());

        putCell(editor, cell(coreEmployee, MONDAY, Slot.MAIN, null, offTypes.get("sick").id(), tang1, 0))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shiftId").doesNotExist())
                .andExpect(jsonPath("$.offTypeId").value(offTypes.get("sick").id()))
                .andExpect(jsonPath("$.locationId").doesNotExist());
    }

    @Test
    void rejectsContentThatDoesNotFitTheCell() throws Exception {
        Cookie editor = login("editor");
        Long tang1 = locations.get("K1.1TD").id();
        Long offSick = offTypes.get("sick").id();

        // Vừa ca vừa nghỉ, hoặc không có gì.
        expectRejected(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K07", false), offSick, null, null),
                "SHIFT_XOR_OFF");
        expectRejected(editor, cell(coreEmployee, MONDAY, Slot.MAIN, null, null, null, null), "SHIFT_XOR_OFF");
        // Ca T7-CN vào ngày thường, ca ngày thường vào T7, ca tối vào khe ca chính.
        expectRejected(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K06", false), null, null, null),
                "SHIFT_NOT_ALLOWED");
        expectRejected(editor, cell(coreEmployee, SATURDAY, Slot.MAIN, shiftId("K07", false), null, null, null),
                "SHIFT_NOT_ALLOWED");
        expectRejected(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K15", false), null, null, null),
                "SHIFT_NOT_ALLOWED");
        // Địa điểm chỉ dành cho ca tối dùng cho ca ngày; địa điểm ngày thường không có ca tối.
        expectRejected(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("K07", false), null,
                locations.get("K1.P321").id(), null), "LOCATION_NOT_ALLOWED");
        expectRejected(editor, cell(coreEmployee, MONDAY, Slot.EVENING, null, null, tang1, null),
                "LOCATION_NOT_ALLOWED");
        // Nhân viên tăng cường không xếp ca ngày thường.
        expectRejected(editor, cell(supportEmployee, MONDAY, Slot.MAIN, shiftId("K07", false), null, null, null),
                "SUPPORT_WEEKDAY");
        // Tuần phải bắt đầu thứ Hai.
        mvc.perform(get("/api/schedule").cookie(editor).param("weekStart", "2026-05-05"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("WEEK_START_NOT_MONDAY"));

        assertThat(assignments.count()).isZero();
    }

    @Test
    void supportStaffCanTakeEveningAndWeekendShifts() throws Exception {
        Cookie editor = login("editor");

        // Ca tối không cần gửi shiftId: đội chỉ có một ca tối (K15).
        putCell(editor, cell(supportEmployee, MONDAY, Slot.EVENING, null, null, locations.get("K1.P321").id(), null))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shiftId").value(shiftId("K15", false)));
        putCell(editor, cell(supportEmployee, SATURDAY, Slot.MAIN, shiftId("K06", false), null,
                locations.get("K1.1TD").id(), null)).andExpect(status().isOk());
    }

    // ---- áp cho cả tuần -----------------------------------------------------------------------

    @Test
    void applyToWeekdaysCanFillOnlyEmptyDaysOrOverwrite() throws Exception {
        Cookie editor = login("editor");
        Long tang1 = locations.get("K1.1TD").id();
        // T4 đã sửa tay thành nghỉ chiều.
        putCell(editor, cell(coreEmployee, "2026-05-06", Slot.MAIN, shiftId("K37", true), null, tang1, null))
                .andExpect(status().isOk());

        mvc.perform(post("/api/assignments/bulk").cookie(editor).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bulk(coreEmployee, shiftId("K07", false), tang1, "FILL_EMPTY")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4));
        assertThat(mainShiftOn("2026-05-06")).isEqualTo(shiftId("K37", true));
        assertThat(assignments.count()).isEqualTo(5);       // T2→T6, không đụng T7/CN

        mvc.perform(post("/api/assignments/bulk").cookie(editor).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bulk(coreEmployee, shiftId("K02", false), tang1, "OVERWRITE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5));
        assertThat(mainShiftOn("2026-05-06")).isEqualTo(shiftId("K02", false));
    }

    // ---- export qua HTTP ----------------------------------------------------------------------

    @Test
    void exportPreviewAndFileShareTheSameRows() throws Exception {
        Cookie editor = login("editor");
        putCell(editor, cell(coreEmployee, MONDAY, Slot.MAIN, shiftId("2K43", true), null,
                locations.get("CS2").id(), null)).andExpect(status().isOk());

        // "2K43" nghỉ chiều: file Fast ghi mã 2K43 kèm ghi chú Nghỉ chiều.
        mvc.perform(get("/api/exports/fast/preview").cookie(editor).param("weekStart", MONDAY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("Ca-lam-viec-2026-05-04.xlsx"))
                .andExpect(jsonPath("$.sheets[0].rows[0][0]").value("24662"))
                .andExpect(jsonPath("$.sheets[0].rows[0][4]").value("2K43"))
                .andExpect(jsonPath("$.sheets[0].rows[0][6]").value("CS2"))
                .andExpect(jsonPath("$.sheets[0].rows[0][7]").value("Nghỉ chiều"));
        // Địa điểm CS2 không lên file Làm sớm.
        mvc.perform(get("/api/exports/early/preview").cookie(editor).param("weekStart", MONDAY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sheets[0].title").value("NGÀY 04-08/5/2026"))
                .andExpect(jsonPath("$.sheets[0].rows.length()").value(0));

        mvc.perform(get("/api/exports/weekend/file").cookie(login("viewer")).param("weekStart", MONDAY))
                .andExpect(status().isOk())
                .andExpect(content().contentType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"T7-CN-2026-05-04.xlsx\""));
        mvc.perform(get("/api/exports/unknown/preview").cookie(editor).param("weekStart", MONDAY))
                .andExpect(status().isNotFound());
    }

    // ---- tiện ích -----------------------------------------------------------------------------

    private Cookie login(String username) throws Exception {
        // Phiên nằm trong Postgres (Spring Session); client chỉ giữ cookie SESSION.
        Cookie session = mvc.perform(post("/api/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"%s\",\"password\":\"%s\"}".formatted(username, PASSWORD)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getCookie("SESSION");
        assertThat(session).as("session cookie").isNotNull();
        return session;
    }

    private ResultActions putCell(Cookie session, String body) throws Exception {
        return mvc.perform(put("/api/assignments").cookie(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private void expectRejected(Cookie session, String body, String code) throws Exception {
        putCell(session, body).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value(code));
    }

    private Long shiftId(String code, boolean halfDay) {
        return catalog.shifts().stream().filter(s -> s.code().equals(code) && s.halfDay() == halfDay).findFirst()
                .orElseThrow().id();
    }

    private Long mainShiftOn(String date) {
        return assignments.findAll().stream()
                .filter(a -> a.getWorkDate().toString().equals(date) && a.getSlot() == Slot.MAIN).findFirst()
                .orElseThrow().getShiftId();
    }

    private static String cell(long employeeId, String date, Slot slot, Long shiftId, Long offTypeId,
            Long locationId, Integer version) {
        return """
                {"employeeId":%d,"date":"%s","slot":"%s","shiftId":%s,"offTypeId":%s,"locationId":%s,"version":%s}
                """.formatted(employeeId, date, slot, shiftId, offTypeId, locationId, version);
    }

    private static String bulk(long employeeId, Long shiftId, Long locationId, String mode) {
        return """
                {"employeeId":%d,"weekStart":"%s","shiftId":%d,"locationId":%d,"mode":"%s"}
                """.formatted(employeeId, MONDAY, shiftId, locationId, mode);
    }
}
