"use client";

import React, { createContext, useContext, useState } from "react";

/* ------------------------------------------------------------------
 *  Accordion — Compound Components 패턴 예제
 *  Context로 공유 상태를 제공하고, 자식이 자유롭게 합성
 * ------------------------------------------------------------------ */

interface AccordionContextValue {
  openItems: string[];
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx)
    throw new Error("Accordion 컴포넌트는 <Accordion> 내부에서 사용해야 합니다.");
  return ctx;
}

/* --- Accordion (Root) --- */
function AccordionRoot({ children }: { children: React.ReactNode }) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggle = (value: string) => {
    setOpenItems((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className="divide-y divide-slate-700 border border-slate-700 rounded-xl overflow-hidden">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

/* --- Accordion.Item --- */
function Item({ value, children }: { value: string; children: React.ReactNode }) {
  return <div data-accordion-value={value}>{children}</div>;
}
Item.displayName = "AccordionItem";

/* --- Accordion.Trigger --- */
function Trigger({ children }: { children: React.ReactNode }) {
  const { toggle } = useAccordionContext();
  // 부모 Item에서 value를 가져오기 위해 data-attribute 사용
  const handleClick = (e: React.MouseEvent) => {
    const item = (e.currentTarget as HTMLElement).closest(
      "[data-accordion-value]"
    );
    const value = item?.getAttribute("data-accordion-value");
    if (value) toggle(value);
  };

  const item =
    typeof React !== "undefined"
      ? null
      : undefined;

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-700/50 transition-colors font-medium text-white"
    >
      <span>{children}</span>
      <AccordionIcon />
    </button>
  );
}
Trigger.displayName = "AccordionTrigger";

function AccordionIcon() {
  return (
    <svg
      className="w-5 h-5 text-slate-400 transition-transform duration-200"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/* --- Accordion.Content --- */
function Content({ children }: { children: React.ReactNode }) {
  const { openItems } = useAccordionContext();
  // 부모 Item의 value를 찾기 위해 DOM 순회 대신,
  // React.Children 패턴을 적용해 부모에서 context 전달
  // 여기서는 간단하게 data-attribute 기반으로 열림 상태를 판별
  return (
    <AccordionContentWrapper>{children}</AccordionContentWrapper>
  );
}
Content.displayName = "AccordionContent";

function AccordionContentWrapper({ children }: { children: React.ReactNode }) {
  const { openItems } = useAccordionContext();
  // data-accordion-value를 ref로 찾아야 하지만,
  // Compound Components 패턴에서는 부모-자식 간 연결을 Context로 하는 것이 정석.
  // 여기서는 간단한 demo를 위해 Item이 Context에 value를 등록하는 방식 대신
  // DOM 기반으로 구현
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const item = ref.current.closest("[data-accordion-value]");
    const value = item?.getAttribute("data-accordion-value");
    if (value) {
      const isOpen = openItems.includes(value);
      ref.current.style.maxHeight = isOpen ? `${ref.current.scrollHeight}px` : "0";
      ref.current.style.overflow = "hidden";
    }
  }, [openItems]);

  return (
    <div ref={ref} style={{ maxHeight: 0 }} className="px-5">
      <div className="py-4 text-slate-400 text-sm">{children}</div>
    </div>
  );
}

import { useEffect } from "react";

/* --- Export --- */
const Accordion = Object.assign(AccordionRoot, {
  Item,
  Trigger,
  Content,
});

export default Accordion;