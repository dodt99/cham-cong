"use client";

import { useState } from "react";

import { LocationSelect } from "@/components/schedule/location-select";
import { useScheduleEnvironment } from "@/components/schedule/schedule-context";
import { ShiftSelect } from "@/components/schedule/shift-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/client";
import type { BulkMode, CellContent, Member } from "@/lib/api/types";
import { WEEK_ACTION_TONE_CLASS } from "@/lib/schedule/day-colors";

type ApplyWeekDialogProps = {
  /** Nhân viên đang được áp; null = đóng hộp thoại. */
  member: Member | null;
  /** Số ngày T2→T6 của nhân viên này đã có nội dung. */
  filledDays: number;
  onApply: (employeeId: number, content: CellContent, mode: BulkMode) => Promise<void>;
  onClose: () => void;
};

/**
 * "Áp cho cả tuần": đặt cùng một ca (hoặc nghỉ) + địa điểm cho T2→T6.
 * Nếu đã có ngày được nhập, người dùng chọn ghi đè tất cả hay chỉ điền ngày còn trống.
 */
export function ApplyWeekDialog({ member, filledDays, onApply, onClose }: ApplyWeekDialogProps) {
  return (
    <Dialog open={member !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {member && (
          <ApplyWeekForm key={member.employeeId} member={member} filledDays={filledDays} onApply={onApply}
            onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ApplyWeekForm({ member, filledDays, onApply, onClose }: ApplyWeekDialogProps & { member: Member }) {
  const { view } = useScheduleEnvironment();
  const [content, setContent] = useState<CellContent>({ shiftId: null, offTypeId: null, locationId: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasChoice = content.shiftId !== null || content.offTypeId !== null;

  async function apply(mode: BulkMode) {
    setSubmitting(true);
    setError(null);
    try {
      await onApply(member.employeeId, content, mode);
      onClose();
    } catch (e) {
      // Giữ hộp thoại để thử lại.
      setError(e instanceof ApiError ? e.message : "Không áp dụng được, vui lòng thử lại.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Áp cho cả tuần</DialogTitle>
        <DialogDescription>
          Đặt cùng một ca và địa điểm cho T2→T6 của <strong>{member.fullName}</strong>. T7, CN và ca tối không đổi.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2 sm:flex-row">
        <ShiftSelect
          groups={view.fullDayShiftGroups}
          offTypes={view.catalog.offTypes}
          shift={content.shiftId === null ? undefined : view.shiftById.get(content.shiftId)}
          offType={view.catalog.offTypes.find((offType) => offType.id === content.offTypeId)}
          emptyLabel="Chọn ca"
          onSelectShift={(shiftId) => setContent({ shiftId, offTypeId: null, locationId: content.locationId })}
          onSelectOff={(offTypeId) => setContent({ shiftId: null, offTypeId, locationId: null })}
          onClear={() => setContent({ shiftId: null, offTypeId: null, locationId: null })}
          className="w-full min-w-0 sm:flex-1"
          toneClassName={WEEK_ACTION_TONE_CLASS}
        />
        <LocationSelect
          locations={view.weekdayLocations}
          blocks={view.catalog.blocks}
          location={content.locationId === null ? undefined : view.locationById.get(content.locationId)}
          onChange={(locationId) => setContent({ ...content, locationId })}
          disabled={content.shiftId === null}
          className="w-full min-w-0 sm:flex-1"
          toneClassName={WEEK_ACTION_TONE_CLASS}
        />
      </div>
      {filledDays > 0 && (
        <p className="text-sm text-muted-foreground">
          Tuần này đã có {filledDays} ngày được nhập. Chọn ghi đè tất cả hoặc chỉ điền những ngày còn trống.
        </p>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <DialogFooter className="gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          Huỷ
        </Button>
        {filledDays > 0 && filledDays < 5 && (
          <Button type="button" variant="outline" disabled={!hasChoice || submitting}
            onClick={() => apply("FILL_EMPTY")}>
            Chỉ điền ngày trống
          </Button>
        )}
        <Button type="button" disabled={!hasChoice || submitting} onClick={() => apply("OVERWRITE")}>
          {filledDays > 0 ? "Ghi đè T2→T6" : "Áp dụng"}
        </Button>
      </DialogFooter>
    </>
  );
}
