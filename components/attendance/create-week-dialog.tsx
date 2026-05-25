"use client";

import { useState } from "react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildWeekOptions,
  formatWeekRange,
  getCurrentWeekStart,
} from "@/lib/utils/week";

type CreateWeekDialogProps = {
  onCreateWeek: (weekStart: string) => void;
  existingWeeks: string[];
};

export function CreateWeekDialog({
  onCreateWeek,
  existingWeeks,
}: CreateWeekDialogProps) {
  const [open, setOpen] = useState(false);
  const weekOptions = buildWeekOptions();
  const defaultWeek = getCurrentWeekStart();
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setSelectedWeek(getCurrentWeekStart());
    }
  };

  const handleConfirm = () => {
    onCreateWeek(selectedWeek);
    setOpen(false);
  };

  const alreadyExists = existingWeeks.includes(selectedWeek);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Tạo bảng mới</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo bảng chấm công</DialogTitle>
          <DialogDescription>
            Chọn tuần cần chấm công. Mỗi tuần là một bảng riêng, lưu trên
            trình duyệt của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="week-select">Tuần</Label>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger id="week-select" className="w-full font-medium">
              <SelectValue placeholder="Chọn tuần" />
            </SelectTrigger>
            <SelectContent>
              {weekOptions.map((weekStart) => (
                <SelectItem
                  key={weekStart}
                  value={weekStart}
                  className="font-medium"
                >
                  {formatWeekRange(weekStart)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {alreadyExists && (
            <p className="text-sm text-muted-foreground">
              Tuần này đã có bảng — bấm Tạo sẽ mở bảng hiện có.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>Tạo bảng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
