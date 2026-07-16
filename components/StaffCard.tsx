"use client";

import { useState } from "react";
import Image from "next/image";
import { Staff } from "@/lib/data";
import StaffModal from "@/components/StaffModal";
import NationalityFlag from "@/components/NationalityFlag";


export default function StaffCard({ member }: { member: Staff }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className="relative overflow-hidden group cursor-pointer"
        style={{ backgroundColor: "var(--color-white)", aspectRatio: "3/4" }}
        onClick={() => setModalOpen(true)}
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
          className="absolute inset-x-0 bottom-0 pt-6 md:pt-12 pb-4 px-4"
          style={{
            background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.94) 38%, rgba(255,255,255,0.45) 60%, transparent 88%)",
            zIndex: 2,
          }}
        >
          {/* Initials badge + flag */}
          <div className="flex items-end justify-between gap-3">
            <span
              className="font-display font-black leading-none block"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.25rem)",
                color: "var(--color-red)",
                lineHeight: 1,
              }}
            >
              {member.initials}
            </span>
            {member.nationality && (
              <NationalityFlag nationality={member.nationality} className="mb-[0.18rem]" />
            )}
          </div>

          {/* Name */}
          <h3
            className="font-display font-bold uppercase leading-tight mt-1 line-clamp-1"
            style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "var(--color-black)" }}
          >
            {member.name}
          </h3>

          {/* Hometown */}
          <p
            className="font-body font-medium mt-1 truncate"
            style={{ fontSize: "clamp(0.65rem, 2vw, 0.8rem)", color: "rgba(10,10,10,0.5)" }}
          >
            {member.hometown}
          </p>
        </div>
      </div>

      {modalOpen && (
        <StaffModal member={member} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
