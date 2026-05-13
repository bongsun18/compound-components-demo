"use client";

import React from "react";

/* ------------------------------------------------------------------
 *  Card — 가장 단순한 Compound Components 예제
 *  Context 없이 정적 속성 합성만으로 구성
 * ------------------------------------------------------------------ */

/* --- Card (Root) --- */
function CardRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors">
      {children}
    </div>
  );
}

/* --- Card.Image --- */
function Image({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="h-40 w-full overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
Image.displayName = "CardImage";

/* --- Card.Header --- */
function Header({ children }: { children: React.ReactNode }) {
  return <div className="px-5 pt-4">{children}</div>;
}
Header.displayName = "CardHeader";

/* --- Card.Title --- */
function Title({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold text-white">{children}</h3>;
}
Title.displayName = "CardTitle";

/* --- Card.Description --- */
function Description({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 text-sm mt-1">{children}</p>;
}
Description.displayName = "CardDescription";

/* --- Card.Footer --- */
function Footer({ children }: { children: React.ReactNode }) {
  return <div className="px-5 pb-4 pt-3">{children}</div>;
}
Footer.displayName = "CardFooter";

/* --- Card.Action --- */
function Action({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer transition-colors">
      {children}
    </span>
  );
}
Action.displayName = "CardAction";

/* --- Export --- */
const Card = Object.assign(CardRoot, {
  Image,
  Header,
  Title,
  Description,
  Footer,
  Action,
});

export default Card;