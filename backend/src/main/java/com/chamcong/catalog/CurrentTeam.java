package com.chamcong.catalog;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.chamcong.catalog.CatalogRepositories.TeamRepository;

/**
 * Đội mà request đang thao tác. V2 chỉ có một đội (cấu hình {@code app.team-code});
 * khi có đội thứ hai, chỉ cần đổi cách chọn đội ở đây.
 */
@Component
public class CurrentTeam {

    private final TeamRepository teams;
    private final String teamCode;
    private volatile Long cachedId;

    CurrentTeam(TeamRepository teams, @Value("${app.team-code}") String teamCode) {
        this.teams = teams;
        this.teamCode = teamCode;
    }

    public Long id() {
        Long id = cachedId;
        if (id == null) {
            id = get().getId();
            cachedId = id;
        }
        return id;
    }

    public Team get() {
        return teams.findByCode(teamCode)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy đội " + teamCode));
    }
}
