"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface OpponentCrestProps {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/** Circular opponent crest. Falls back to an initial monogram if no logo is set or the image fails to load. */
export default function OpponentCrest({ name, logoUrl, size = 96, className = "" }: OpponentCrestProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logoUrl]);

  const showImage = !!logoUrl && !failed;

  return (
    <div
      className={`relative flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: showImage ? "transparent" : "var(--color-gray-light)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {showImage ? (
        <Image
          src={logoUrl!}
          alt={`${name} crest`}
          fill
          className="object-contain p-1.5"
          sizes={`${size}px`}
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="font-display font-black uppercase leading-none"
          style={{ fontSize: size * 0.4, color: "var(--color-gray-mid)" }}
        >
          {initial(name)}
        </span>
      )}
    </div>
  );
}
