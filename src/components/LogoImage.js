"use client";
import { useState } from "react";
import Image from "next/image";

/**
 * Renders the Ressa logo. Uses the new logo by default and gracefully falls
 * back to the original logo if the new file has not been saved yet — so the
 * UI never shows a broken image.
 *
 * `animate` adds a gentle float + hover spin/glow ("party") effect.
 */
const NEW_LOGO = "/images/ressa-logo.jpeg";
const FALLBACK = "/images/ressa-logo.jpeg";

export default function LogoImage({
  src,
  alt = "Ressa Project Nigeria",
  width = 160,
  height = 160,
  className = "",
  animate = false,
  priority = false,
  round = true,
}) {
  const [imgSrc, setImgSrc] = useState(src || NEW_LOGO);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      onError={() => {
        if (imgSrc !== FALLBACK) setImgSrc(FALLBACK);
      }}
      className={`${round ? "rounded-full" : ""} object-contain ${
        animate ? "logo-anim" : ""
      } ${className}`}
    />
  );
}
