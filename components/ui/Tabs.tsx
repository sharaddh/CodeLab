"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue>({ active: "", setActive: () => {} });

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex border-b border-[var(--border)]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabTriggerProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function TabTrigger({ id, children, className }: TabTriggerProps) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === id;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(id)}
      className={cn(
        "px-3 py-2 text-[12px] font-semibold transition-colors border-b-2 -mb-px",
        isActive
          ? "text-[var(--violet)] border-[var(--violet)]"
          : "text-[var(--muted)] border-transparent hover:text-[var(--text)]",
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabContentProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function TabContent({ id, children, className }: TabContentProps) {
  const { active } = useContext(TabsContext);
  if (active !== id) return null;
  return (
    <div role="tabpanel" className={cn("py-3", className)}>
      {children}
    </div>
  );
}
