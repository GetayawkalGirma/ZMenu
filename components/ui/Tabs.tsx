"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue?: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  isActive?: boolean;
}

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || "");

  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childType = child.type as any;

          if (childType.name === "TabsList") {
            return React.cloneElement(child as React.ReactElement<any>, {
              activeTab,
              setActiveTab,
            });
          }

          if (childType.name === "TabsContent") {
            return React.cloneElement(child as React.ReactElement<any>, {
              isActive: (child as any).props.value === activeTab,
            });
          }
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({
  className,
  children,
  activeTab,
  setActiveTab,
}: any) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600",
        className,
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childElement = child as React.ReactElement<any>;
          return React.cloneElement(childElement, {
            isActive: childElement.props.value === activeTab,
            onClick: () => setActiveTab?.(childElement.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
  isActive,
  onClick,
}: TabsTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "hover:bg-white/50 hover:text-gray-900",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
  isActive,
}: TabsContentProps) {
  if (!isActive) return null;

  return (
    <div
      className={cn(
        "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
