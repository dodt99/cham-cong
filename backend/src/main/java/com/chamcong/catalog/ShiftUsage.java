package com.chamcong.catalog;

import java.util.Map;

/**
 * Ca đang được dùng ở bao nhiêu phân công. Module schedule trả lời câu hỏi này,
 * để catalog không phải phụ thuộc ngược vào bảng phân công.
 */
public interface ShiftUsage {

    /** Số phân công của từng ca trong đội; ca chưa dùng không có trong map. */
    Map<Long, Long> assignmentCountByShift(Long teamId);
}
