import Image from "next/image";
import { Staff } from "@/lib/data";

export default function StaffCard({ member }: { member: Staff }) {
  return (
    <div
      className="relative overflow-hidden group"
      style={{ backgroundColor: "var(--color-black)", aspectRatio: "3/4" }}
    >
      {/* Photo */}
      <Image
        src={member.image}
        alt={member.name}
        fill
        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* Gradient — tight strip at the bottom only */}
      <div
        className="absolute inset-x-0 bottom-0 pt-6 md:pt-16 px-3 pb-3"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, transparent 100%)",
          zIndex: 2,
        }}
      >
        {/* Initials badge */}
        <div
          className="inline-flex items-center justify-center w-7 h-7 mb-1.5 font-display font-black text-white"
          style={{ backgroundColor: "var(--color-red)", fontSize: "0.65rem" }}
        >
          {member.initials}
        </div>

        {/* Name */}
        <h3
          className="font-display font-bold uppercase text-white leading-tight line-clamp-1"
          style={{ fontSize: "clamp(0.75rem, 3vw, 1rem)" }}
        >
          {member.name}
        </h3>

        {/* Role */}
        <p
          className="font-display tracking-widest uppercase mt-0.5 line-clamp-1"
          style={{ fontSize: "clamp(0.55rem, 2vw, 0.65rem)", color: "var(--color-red)" }}
        >
          {member.role}
        </p>

        {/* Hometown */}
        <p
          className="font-body font-medium mt-0.5 truncate"
          style={{ fontSize: "clamp(0.6rem, 2vw, 0.8rem)", color: "rgba(255,255,255,0.75)" }}
        >
          {member.hometown}
        </p>
      </div>
    </div>
  );
}
