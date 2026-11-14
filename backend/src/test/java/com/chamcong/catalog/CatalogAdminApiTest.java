package com.chamcong.catalog;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.jayway.jsonpath.JsonPath;

import com.chamcong.PostgresTestConfig;
import com.chamcong.auth.AppUser;
import com.chamcong.auth.AppUserRepository;
import com.chamcong.auth.Role;
import com.chamcong.schedule.AssignmentRepository;

/**
 * Quản trị danh mục và người dùng qua HTTP. Test này thay đổi danh mục nên dùng database riêng
 * (context bị huỷ sau lớp test) để không ảnh hưởng các phép so golden.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(PostgresTestConfig.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class CatalogAdminApiTest {

    private static final String PASSWORD = "mat-khau-thu-nghiem";
    private static final String MONDAY = "2026-05-04";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private AppUserRepository users;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AssignmentRepository assignments;

    private Cookie admin;

    @BeforeEach
    void setUp() throws Exception {
        assignments.deleteAllInBatch();
        users.deleteAllInBatch();
        users.save(new AppUser("admin", passwordEncoder.encode(PASSWORD), "Admin", Role.ADMIN));
        users.save(new AppUser("editor", passwordEncoder.encode(PASSWORD), "Editor", Role.EDITOR));
        admin = login("admin", PASSWORD);
    }

    @Test
    void onlyAdminsReachTheAdminApi() throws Exception {
        Cookie editor = login("editor", PASSWORD);
        // Danh sách quản trị có MST nên EDITOR không được đọc.
        mvc.perform(get("/api/admin/employees").cookie(editor)).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/reference").cookie(editor)).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/employees").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(47))
                .andExpect(jsonPath("$[0].code").value("24662"))
                .andExpect(jsonPath("$[0].taxCode").value("8712601809"));
        mvc.perform(get("/api/admin/reference").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.positions.length()").value(2))
                .andExpect(jsonPath("$.sites.length()").value(2))
                .andExpect(jsonPath("$.blocks.length()").value(11));
    }

    @Test
    void newEmployeeJoinsTheRosterAndLeavesAfterTheirEndDate() throws Exception {
        long positionId = idOf(mvc.perform(get("/api/admin/reference").cookie(admin)), "$.positions[0].id");
        String body = """
                {"code":"99001","fullName":"Nguyễn Văn Mới","taxCode":"0123456789","positionId":%d,"membership":"CORE"}
                """.formatted(positionId);

        long employeeId = idOf(send(post("/api/admin/employees"), body).andExpect(status().isCreated())
                .andExpect(jsonPath("$.sortOrder").value(370)), "$.employeeId");       // xếp cuối đội chính
        send(post("/api/admin/employees"), body).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMPLOYEE_CODE_TAKEN"));

        // Người mới đứng cuối đội chính (vị trí 37), trước nhóm tăng cường.
        mvc.perform(get("/api/schedule").cookie(admin).param("weekStart", MONDAY))
                .andExpect(jsonPath("$.members.length()").value(48))
                .andExpect(jsonPath("$.members[36].code").value("99001"))
                .andExpect(jsonPath("$.members[37].membership").value("SUPPORT"));

        // Nghỉ việc từ 30/04: tuần sau đó không còn trong danh sách, tuần trước đó vẫn còn.
        send(put("/api/admin/employees/" + employeeId), """
                {"code":"99001","fullName":"Nguyễn Văn Mới","taxCode":"0123456789","positionId":%d,"membership":"CORE",
                 "sortOrder":370,"activeTo":"2026-04-30"}
                """.formatted(positionId)).andExpect(status().isOk());
        mvc.perform(get("/api/schedule").cookie(admin).param("weekStart", MONDAY))
                .andExpect(jsonPath("$.members.length()").value(47));
        mvc.perform(get("/api/schedule").cookie(admin).param("weekStart", "2026-04-27"))
                .andExpect(jsonPath("$.members.length()").value(48));
    }

    @Test
    void shiftsCanBeAddedAndRetiredWithoutCode() throws Exception {
        String shift = """
                {"code":"K99","startTime":"06:15","endTime":"16:45","slot":"MAIN","halfDay":false,"onWeekday":true,
                 "onWeekend":false,"siteId":null,"earlyEligible":true,"earlyEndTime":null,"sortOrder":45,"active":%s}
                """;
        long shiftId = idOf(send(post("/api/admin/shifts"), shift.formatted(true)).andExpect(status().isCreated()),
                "$.id");
        send(post("/api/admin/shifts"), shift.formatted(true)).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("SHIFT_CODE_TAKEN"));
        // Cùng mã nhưng là bản nghỉ chiều thì được (như "2K43").
        send(post("/api/admin/shifts"), shift.formatted(true).replace("\"halfDay\":false", "\"halfDay\":true")
                .replace("16:45", "12:00")).andExpect(status().isCreated());
        send(post("/api/admin/shifts"), shift.formatted(true).replace("K99", "K98").replace("16:45", "05:00"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("SHIFT_TIME_INVALID"));

        mvc.perform(get("/api/catalog").cookie(admin))
                .andExpect(jsonPath("$.shifts[?(@.code=='K99')]").value(hasSize(2)));

        long employeeId = idOf(mvc.perform(get("/api/admin/employees").cookie(admin)), "$[0].employeeId");
        String cell = """
                {"employeeId":%d,"date":"%s","slot":"MAIN","shiftId":%d,"version":%s}
                """;
        send(put("/api/assignments"), cell.formatted(employeeId, MONDAY, shiftId, null)).andExpect(status().isOk());

        // Tắt ca: ô đã xếp giữ nguyên, nhưng không xếp mới được nữa.
        send(put("/api/admin/shifts/" + shiftId), shift.formatted(false)).andExpect(status().isOk());
        send(put("/api/assignments"), cell.formatted(employeeId, "2026-05-05", shiftId, null))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("SHIFT_NOT_ALLOWED"));
        mvc.perform(get("/api/exports/fast/preview").cookie(admin).param("weekStart", MONDAY))
                .andExpect(jsonPath("$.sheets[0].rows[0][4]").value("K99"));
    }

    @Test
    void shiftInUseKeepsItsKindButCanStillBeEdited() throws Exception {
        String shift = """
                {"code":"K97","startTime":"%s","endTime":"16:45","slot":"%s","halfDay":false,"onWeekday":true,
                 "onWeekend":false,"siteId":null,"earlyEligible":false,"earlyEndTime":null,"sortOrder":46,"active":true}
                """;
        long shiftId = idOf(send(post("/api/admin/shifts"), shift.formatted("06:15", "MAIN"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.usageCount").value(0)), "$.id");

        // Chưa ai dùng thì đổi loại tuỳ ý.
        send(put("/api/admin/shifts/" + shiftId), shift.formatted("06:15", "EVENING")).andExpect(status().isOk());
        send(put("/api/admin/shifts/" + shiftId), shift.formatted("06:15", "MAIN")).andExpect(status().isOk());

        long employeeId = idOf(mvc.perform(get("/api/admin/employees").cookie(admin)), "$[0].employeeId");
        send(put("/api/assignments"), """
                {"employeeId":%d,"date":"%s","slot":"MAIN","shiftId":%d,"version":null}
                """.formatted(employeeId, MONDAY, shiftId)).andExpect(status().isOk());
        mvc.perform(get("/api/admin/shifts").cookie(admin))
                .andExpect(jsonPath("$[?(@.code=='K97')].usageCount").value(contains(1)));

        // Đã xếp: không biến ca chính thành ca tối được, nhưng vẫn sửa được giờ.
        send(put("/api/admin/shifts/" + shiftId), shift.formatted("06:15", "EVENING"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("SHIFT_IN_USE"));
        send(put("/api/admin/shifts/" + shiftId), shift.formatted("06:30", "MAIN")).andExpect(status().isOk())
                .andExpect(jsonPath("$.usageCount").value(1)).andExpect(jsonPath("$.startTime").value("06:30:00"));
    }

    @Test
    void locationsCanBeAddedAndCodesStayUnique() throws Exception {
        ResultActions reference = mvc.perform(get("/api/admin/reference").cookie(admin));
        long siteId = idOf(reference, "$.sites[0].id");
        long blockId = idOf(reference, "$.blocks[0].id");
        String location = """
                {"code":"K1.P999","name":"P999","siteId":%d,"blockId":%d,"onWeekday":true,"onEvening":true,
                 "onWeekend":false,"sortOrder":15,"active":true}
                """.formatted(siteId, blockId);

        send(post("/api/admin/locations"), location).andExpect(status().isCreated());
        send(post("/api/admin/locations"), location).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("LOCATION_CODE_TAKEN"));
        mvc.perform(get("/api/catalog").cookie(admin))
                .andExpect(jsonPath("$.locations.length()").value(34))
                .andExpect(jsonPath("$.locations[1].code").value("K1.P999"));     // theo sortOrder
    }

    @Test
    void adminCreatesAccountsThatCanLogIn() throws Exception {
        send(post("/api/users"), """
                {"username":"thuky","password":"mat-khau-moi-1","fullName":"Thư ký","role":"EDITOR"}
                """).andExpect(status().isCreated());
        send(post("/api/users"), """
                {"username":"thuky","password":"mat-khau-moi-1","fullName":"Thư ký","role":"EDITOR"}
                """).andExpect(status().isConflict());
        send(post("/api/users"), """
                {"username":"ngan","password":"ngan","fullName":"Mật khẩu quá ngắn","role":"VIEWER"}
                """).andExpect(status().isBadRequest());

        Cookie session = login("thuky", "mat-khau-moi-1");
        mvc.perform(get("/api/auth/me").cookie(session)).andExpect(jsonPath("$.role").value("EDITOR"));

        // Không thể tự hạ quyền admin cuối cùng.
        long adminId = idOf(mvc.perform(get("/api/auth/me").cookie(admin)), "$.id");
        send(put("/api/users/" + adminId), """
                {"fullName":"Admin","role":"VIEWER","active":true}
                """).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("LAST_ADMIN"));
    }

    // ---- tiện ích -----------------------------------------------------------------------------

    private Cookie login(String username, String password) throws Exception {
        return mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"%s\",\"password\":\"%s\"}".formatted(username, password)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getCookie("SESSION");
    }

    private ResultActions send(MockHttpServletRequestBuilder request, String json) throws Exception {
        return mvc.perform(request.cookie(admin).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private static long idOf(ResultActions result, String jsonPath) throws Exception {
        String body = result.andReturn().getResponse().getContentAsString();
        Object value = JsonPath.read(body, jsonPath);
        return ((Number) value).longValue();
    }
}
