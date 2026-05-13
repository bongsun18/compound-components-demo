"use client";

import React, { createContext, useContext, useState } from "react";

/* ------------------------------------------------------------------
 *  Tabs — Compound Components 패턴 예제
 * ------------------------------------------------------------------ */

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx)
    throw new Error("Tabs 컴포넌트는 <Tabs> 내부에서 사용해야 합니다.");
  return ctx;
}

/* --- Tabs (Root) --- */
function TabsRoot({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

/* --- Tabs.List --- */
function List({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex border-b border-slate-700 gap-1">{children}</div>
  );
}
List.displayName = "TabsList";

/* --- Tabs.Trigger --- */
function Trigger({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
        isActive
          ? "text-blue-400"
          : "text-slate-400 hover:text-slate-300"
      }`}
    >
      {children}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
      )}
    </button>
  );
}
Trigger.displayName = "TabsTrigger";

/* --- Tabs.Content --- */
function Content({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;

  return (
    <div className="py-4 text-slate-300 animate-[fadeIn_0.15s_ease-out]">
      {children}
    </div>
  );
}
Content.displayName = "TabsContent";

/* --- Export --- */
const Tabs = Object.assign(TabsRoot, {
  List,
  Trigger,
  Content,
});

export default Tabs;