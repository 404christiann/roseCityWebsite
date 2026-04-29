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

      {/* Gradient */}
      <div
        className="absolute inset-x-0 bottom-0 pt-20 pb-5 px-5"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.5) 60%, transparent 100%)",
          zIndex: 2,
        }}
      >
        {/* Initials badge */}
        <div
          className="inline-flex items-center justify-center w-10 h-10 mb-3 font-display font-black text-white text-sm"
          style={{ backgroundColor: "var(--color-red)" }}
        >
          {member.initials}
        </div>

        {/* Name */}
        <h3
          className="font-display font-bold uppercase text-white leading-tight"
          style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
        >
          {member.name}
        </h3>

        {/* Role */}
        <p
          className="font-display text-xs tracking-widest uppercase mt-1"
          style={{ color: "var(--color-red)" }}
        >
          {member.role}
        </p>

        {/* Hometown */}
        <p
          className="font-body text-sm font-medium mt-1"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          {member.hometown}
        </p>
      </div>
    </div>
  );
}
