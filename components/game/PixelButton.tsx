"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger" | "yes";
};

export function PixelButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: Props) {
  const tones = {
    primary: "bg-[#f4a261] text-[#1a1208] hover:bg-[#ffb56b]",
    yes: "bg-[#2a9d8f] text-[#041210] hover:bg-[#3dbeb0]",
    danger: "bg-[#7a3b3b] text-[#fde8e8] hover:bg-[#934848]",
    ghost: "bg-[#1a2a2e] text-[#e8f1e8] hover:bg-[#24383d]",
  }[variant];

  return (
    <button
      type="button"
      className={`pixel-btn ${tones} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
