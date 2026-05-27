"use client";

import { create } from "zustand";

export type FirestoreSyncState =
  | { status: "idle" }
  | { status: "saving"; seq: number }
  | { status: "saved"; seq: number; savedAt: number }
  | { status: "error"; seq: number; message: string };

type FirestoreSyncStore = {
  state: FirestoreSyncState;
  beginSaving: () => number;
  markSaved: (seq: number) => void;
  markError: (seq: number, err: unknown) => void;
};

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Không thể lưu dữ liệu lên Firestore.";
}

export const useFirestoreSyncStatus = create<FirestoreSyncStore>((set, get) => ({
  state: { status: "idle" },

  beginSaving: () => {
    const prev = get().state;
    const nextSeq =
      prev.status === "saving" ||
      prev.status === "saved" ||
      prev.status === "error"
        ? prev.seq + 1
        : 1;

    set({ state: { status: "saving", seq: nextSeq } });
    return nextSeq;
  },

  markSaved: (seq) => {
    set((s) => {
      if (s.state.status !== "saving" || s.state.seq !== seq) return s;
      return { state: { status: "saved", seq, savedAt: Date.now() } };
    });
  },

  markError: (seq, err) => {
    const message = toErrorMessage(err);
    set((s) => {
      if (s.state.status !== "saving" || s.state.seq !== seq) return s;
      return { state: { status: "error", seq, message } };
    });
  },
}));

