"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { selectWeekStarts } from "@/lib/attendance/selectors";
import { useAttendanceZustandStore } from "@/stores/attendance-store";
import { useShallow } from "zustand/react/shallow";

export function ClearAttendanceDataButton() {
  const [open, setOpen] = useState(false);
  const weekStarts = useAttendanceZustandStore(useShallow(selectWeekStarts));
  const clearAllData = useAttendanceZustandStore((s) => s.clearAllData);
  const hasData = weekStarts.length > 0;

  function handleConfirm() {
    clearAllData();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={!hasData}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
          Xóa dữ liệu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa toàn bộ dữ liệu chấm công?</DialogTitle>
          <DialogDescription>
            Thao tác này xóa vĩnh viễn tất cả bảng chấm công. Không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="mt-1 sm:mt-0">
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Xóa hết
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
