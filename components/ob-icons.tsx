"use client";

import React from "react";

export type IconName =
  | "back" | "chevR" | "chevD" | "check" | "checkCircle" | "x" | "lock" | "shield"
  | "send" | "plus" | "image" | "star" | "info" | "clock" | "spark" | "rupee" | "bolt"
  | "swap" | "doc" | "eye" | "chat" | "arrowR" | "heart" | "grid" | "pencil" | "play"
  | "instagram" | "video" | "camera" | "phone" | "mail" | "pin" | "user" | "search"
  | "trash" | "box" | "building" | "tag" | "sliders" | "verified" | "link" | "logout";

export function Icon({
  name, size = 20, c = "currentColor", w = 1.85, style, fill = "none",
}: {
  name: IconName;
  size?: number;
  c?: string;
  w?: number;
  style?: React.CSSProperties;
  fill?: string;
}) {
  const p = { fill: "none", stroke: c, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, React.ReactNode> = {
    back:        <path d="M14 5l-7 7 7 7" {...p} />,
    chevR:       <path d="M9 5l7 7-7 7" {...p} />,
    chevD:       <path d="M5 9l7 7 7-7" {...p} />,
    check:       <path d="M5 12.5l4.5 4.5L19 6.5" {...p} />,
    checkCircle: <g><circle cx="12" cy="12" r="9" {...p} /><path d="M8.2 12.2l2.6 2.6 5-5.4" {...p} /></g>,
    x:           <path d="M6 6l12 12M18 6L6 18" {...p} />,
    lock:        <g><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" {...p} /><path d="M8 10.5V8a4 4 0 018 0v2.5" {...p} /></g>,
    shield:      <g><path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6l7-3z" {...p} /><path d="M9 12l2 2 4-4.2" {...p} /></g>,
    send:        <path d="M5 12l15-7-5 15-3.5-5.5L5 12z" {...p} />,
    plus:        <path d="M12 5v14M5 12h14" {...p} />,
    image:       <g><rect x="4" y="4" width="16" height="16" rx="3" {...p} /><circle cx="9" cy="9.5" r="1.6" {...p} /><path d="M5 17l4.5-4.5 3.5 3 3-2.5L19 16" {...p} /></g>,
    star:        <path d="M12 4l2.4 5 5.4.7-4 3.7 1 5.3-4.8-2.6-4.8 2.6 1-5.3-4-3.7 5.4-.7L12 4z" stroke={c} strokeWidth={w} strokeLinejoin="round" fill={fill} />,
    info:        <g><circle cx="12" cy="12" r="9" {...p} /><path d="M12 11v5M12 8h.01" {...p} /></g>,
    clock:       <g><circle cx="12" cy="12" r="8.5" {...p} /><path d="M12 7.5V12l3 2" {...p} /></g>,
    spark:       <path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8L12 3.5z" stroke={c} strokeWidth={w} strokeLinejoin="round" fill={fill} />,
    rupee:       <g><path d="M7 5h10M7 9h10M16.5 5c0 4-3.2 5-6 5h-1l6.5 9" {...p} /></g>,
    bolt:        <path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" stroke={c} strokeWidth={w} strokeLinejoin="round" fill={fill} />,
    swap:        <g><path d="M7 7h11l-3-3M17 17H6l3 3" {...p} /></g>,
    doc:         <g><path d="M7 3h7l4 4v14H7z" {...p} /><path d="M14 3v4h4M10 13h6M10 16.5h6" {...p} /></g>,
    eye:         <g><path d="M3 12s3.5-6.5 9-6.5S21 12 21 12s-3.5 6.5-9 6.5S3 12 3 12z" {...p} /><circle cx="12" cy="12" r="2.6" {...p} /></g>,
    chat:        <path d="M5 5h14v10H9l-4 4V5z" {...p} />,
    arrowR:      <path d="M5 12h14M14 6l6 6-6 6" {...p} />,
    heart:       <path d="M12 20S4 14.5 4 9.2A4.2 4.2 0 0112 6a4.2 4.2 0 018 3.2C20 14.5 12 20 12 20z" stroke={c} strokeWidth={w} strokeLinejoin="round" fill={fill} />,
    grid:        <g><rect x="4" y="4" width="7" height="7" rx="1.6" {...p} /><rect x="13" y="4" width="7" height="7" rx="1.6" {...p} /><rect x="4" y="13" width="7" height="7" rx="1.6" {...p} /><rect x="13" y="13" width="7" height="7" rx="1.6" {...p} /></g>,
    pencil:      <path d="M5 19l1-4L16 5l3 3L9 18l-4 1z" {...p} />,
    play:        <path d="M8 6l10 6-10 6V6z" stroke={c} strokeWidth={w} strokeLinejoin="round" fill={fill} />,
    instagram:   <g><rect x="3.5" y="3.5" width="17" height="17" rx="5" {...p} /><circle cx="12" cy="12" r="4" {...p} /><circle cx="17" cy="7" r="1.15" fill={c} stroke="none" /></g>,
    video:       <g><rect x="3" y="6" width="13" height="12" rx="2.5" {...p} /><path d="M16 10l5-3v10l-5-3z" {...p} /></g>,
    camera:      <g><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" {...p} /><circle cx="12" cy="13" r="3.4" {...p} /></g>,
    phone:       <path d="M6 3h3.5l1.8 4.5-2.3 1.6a11 11 0 005 5l1.6-2.3L20 14.5V18a2 2 0 01-2.2 2A15.5 15.5 0 014 6.2 2 2 0 016 3z" {...p} />,
    mail:        <g><rect x="3" y="5" width="18" height="14" rx="3" {...p} /><path d="M4 7.5l8 5.5 8-5.5" {...p} /></g>,
    pin:         <g><path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" {...p} /><circle cx="12" cy="10" r="2.5" {...p} /></g>,
    user:        <g><circle cx="12" cy="8" r="4" {...p} /><path d="M4.5 20c1.4-4 4.4-6 7.5-6s6.1 2 7.5 6" {...p} /></g>,
    search:      <g><circle cx="11" cy="11" r="6.5" {...p} /><path d="M16 16l4.5 4.5" {...p} /></g>,
    trash:       <g><path d="M5 7h14M10 7V5h4v2M6.5 7l.9 13h9.2l.9-13" {...p} /></g>,
    box:         <g><path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z" {...p} /><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" {...p} /></g>,
    building:    <g><rect x="5" y="3.5" width="14" height="17" rx="2" {...p} /><path d="M9 8h2M13 8h2M9 12h2M13 12h2M10 20v-3h4v3" {...p} /></g>,
    tag:         <g><path d="M4 4h7l9 9-7 7-9-9V4z" {...p} /><circle cx="8.3" cy="8.3" r="1.2" fill={c} stroke="none" /></g>,
    sliders:     <g><path d="M4 7h9M19 7h1M4 17h1M11 17h9" {...p} /><circle cx="15.5" cy="7" r="2" {...p} /><circle cx="7.5" cy="17" r="2" {...p} /></g>,
    verified:    <g><path d="M12 3l2.1 1.6 2.6-.2 1 2.4 2.3 1.2-.5 2.6 1.3 2.3-1.7 2 .2 2.6-2.5.7-1.2 2.3-2.5-.7L12 21l-2.4-1.5-2.5.7-1.2-2.3-2.5-.7.2-2.6-1.7-2L3.4 10 2.9 7.4l2.3-1.2 1-2.4 2.6.2z" {...p} /><path d="M8.5 12l2.3 2.3 4.3-4.6" {...p} /></g>,
    link:        <g><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" {...p} /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" {...p} /></g>,
    logout:      <g><path d="M14 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2v-2" {...p} /><path d="M10 12h10M17 9l3 3-3 3" {...p} /></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0, ...style }}>
      {paths[name]}
    </svg>
  );
}
