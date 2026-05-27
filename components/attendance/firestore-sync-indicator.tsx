"use client";

import { useFirestoreSyncStatus } from "@/lib/storage/firestore-sync-status";
import { CloudCheck, CloudOff, Loader2 } from "lucide-react";

export function FirestoreSyncIndicator() {
  const state = useFirestoreSyncStatus((s) => s.state);

  if (state.status === "idle") return null;

  if (state.status === "saving") {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        className="flex items-center gap-1 text-xs text-destructive"
        title={state.message}
      >
        <CloudOff className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <CloudCheck className="h-4 w-4" />
    </div>
  );
}

