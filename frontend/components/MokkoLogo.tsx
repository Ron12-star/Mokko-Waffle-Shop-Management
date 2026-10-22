"use client";
import React, { useState } from "react";

interface MokkoLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  className?: string;
}

export default function MokkoLogo({
  size = "md",
  showSubtitle = true,
  className = "",
}: MokkoLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Size specifications
  const scale =
    size === "sm"
      ? { text: "22px", sub: "8px", tracking: "0.22em", gap: "2px", stroke: "2px" }
      : size === "lg"
      ? { text: "40px", sub: "12px", tracking: "0.3em", gap: "6px", stroke: "3px" }
      : size === "xl"
      ? { text: "56px", sub: "16px", tracking: "0.32em", gap: "8px", stroke: "4px" }
      : { text: "28px", sub: "9.5px", tracking: "0.26em", gap: "3px", stroke: "2.5px" }; // md

  // Check if image exists in /public
  return (
    <div
      className={`mokko-logo-brand ${className}`}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        lineHeight: 1,
      }}
    >
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo.png"
          alt="MOKKO Desserts & Coffee"
          onError={() => setImgError(true)}
          style={{
            maxHeight: size === "sm" ? 38 : size === "lg" ? 72 : size === "xl" ? 96 : 52,
            objectFit: "contain",
          }}
        />
      ) : null}

      {imgError && (
        <div style={{ textAlign: "center" }}>
          {/* Stylized Bubble Logo "MOKKO" matching the brand contour */}
          <div
            style={{
              fontFamily: "'Fredoka', 'DynaPuff', 'Chewy', cursive, sans-serif",
              fontSize: scale.text,
              fontWeight: 800,
              letterSpacing: "0.04em",
              color: "#FAEDE1",
              textShadow: `
                -${scale.stroke} -${scale.stroke} 0 #4A2311,
                 ${scale.stroke} -${scale.stroke} 0 #4A2311,
                -${scale.stroke}  ${scale.stroke} 0 #4A2311,
                 ${scale.stroke}  ${scale.stroke} 0 #4A2311,
                 0px ${scale.stroke} 0 #4A2311,
                 ${scale.stroke} 0px 0 #4A2311,
                -${scale.stroke} 0px 0 #4A2311,
                 0px -${scale.stroke} 0 #4A2311,
                 0 4px 10px rgba(74, 35, 17, 0.35)
              `,
              transform: "scaleY(0.96)",
              display: "inline-block",
            }}
          >
            MOKKO
          </div>

          {showSubtitle && (
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: scale.sub,
                fontWeight: 800,
                color: "var(--brand-choco, #4A2311)",
                letterSpacing: scale.tracking,
                marginTop: scale.gap,
                textTransform: "uppercase",
                opacity: 0.95,
              }}
            >
              DESSERTS &amp; COFFEE
            </div>
          )}
        </div>
      )}
    </div>
  );
}
