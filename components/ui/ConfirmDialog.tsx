"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./Dialog";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  loading = false,
  destructive = false,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className={`px-6 pt-6 pb-2 ${destructive ? "bg-red-50" : "bg-white"}`}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              {destructive && (
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              )}
              <DialogTitle className="text-base font-black text-gray-900 uppercase tracking-tight">
                {title}
              </DialogTitle>
            </div>
            {description && (
              <DialogDescription className="text-sm text-gray-500 leading-relaxed mt-1 ml-12">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        <DialogFooter className="px-6 py-4 bg-white border-t border-gray-100 flex flex-row gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 sm:flex-none rounded-xl font-black uppercase tracking-widest text-xs border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 sm:flex-none rounded-xl font-black uppercase tracking-widest text-xs shadow-lg ${
              destructive
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                : "bg-gray-900 hover:bg-black text-white"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
