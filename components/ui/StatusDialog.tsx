"use client";

import * as React from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ArrowRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@/components/ui";

export type StatusType = "success" | "error" | "warning" | "info";

interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: StatusType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  cancelLabel?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    glow: "bg-emerald-400/20",
  },
  error: {
    icon: XCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    button: "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
    glow: "bg-rose-400/20",
  },
  warning: {
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    button: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
    glow: "bg-amber-400/20",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    button: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    glow: "bg-blue-400/20",
  },
};

export function StatusDialog({
  open,
  onOpenChange,
  type = "info",
  title,
  description,
  actionLabel = "Continue",
  onAction,
  cancelLabel = "Close",
}: StatusDialogProps) {
  const config = statusConfig[type];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-0 rounded-[2.5rem] shadow-2xl">
        {/* Background Accent */}
        <div className={cn("h-32 w-full relative overflow-hidden", config.bg)}>
            <div className={cn("absolute inset-0 opacity-50 blur-3xl", config.glow)} />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl border animate-in zoom-in-50 duration-500",
                    "bg-white",
                    config.border
                )}>
                    <Icon className={cn("w-8 h-8", config.color)} />
                </div>
            </div>
        </div>

        <div className="p-8 pt-6 text-center">
            <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl font-black text-gray-900 tracking-tighter uppercase text-center leading-none">
                    {title}
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-gray-400 text-center px-2">
                    {description}
                </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col sm:flex-col gap-3 mt-6">
                <Button 
                    onClick={() => {
                        if (onAction) onAction();
                        onOpenChange(false);
                    }}
                    className={cn(
                        "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl text-white transition-all hover:scale-[1.02] active:scale-95",
                        config.button
                    )}
                >
                    {actionLabel}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button 
                    variant="ghost" 
                    onClick={() => onOpenChange(false)}
                    className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors"
                >
                    {cancelLabel}
                </Button>
            </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
