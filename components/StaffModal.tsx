"use client";

import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import Image from "next/image";
import { Staff } from "@/lib/data";
import { FLAG_CODES } from "@/lib/flags";


interface Props {
  member: Staff;
  onClose: () => void;
}

export default function StaffModal({ member, onClose }: Props) {
  const flagCode = member.nationality ? FLAG_CODES[member.nationality] : null;

  return (
    <Dialog open={true} onClose={onClose} className="relative z-[100]">

      {/* Backdrop */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm duration-300 ease-out data-closed:opacity-0"
      />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-end md:items-center justify-center">
        <DialogPanel
          transition
          className="
            w-full md:w-[480px] flex flex-col overflow-hidden
            bg-[#0e0e0e]
            rounded-t-2xl md:rounded-2xl
            duration-300 ease-out
            data-closed:opacity-0
            data-closed:translate-y-8
            md:data-closed:translate-y-4
            md:data-closed:scale-95
          "
          style={{ maxHeight: "90vh" }}
        >
          {/* Photo */}
          <div
            className="relative flex-shrink-0 w-full h-[400px] rounded-t-2xl overflow-hidden"
            style={{ WebkitTransform: "translateZ(0)" }}
          >
            <Image
              src={member.image}
              alt={member.name}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 480px"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(14,14,14,0.95) 0%, transparent 55%)" }}
            />

            {/* Drag handle — mobile only */}
            <div className="md:hidden absolute top-0 left-0 right-0 flex justify-center pt-3">
              <div className="w-9 h-1 rounded-full bg-white/30" />
            </div>

            {/* Close button — top right always */}
            <button
              onClick={onClose}
              className="absolute top-3 right-4 flex items-center justify-center"
              style={{ color: "#000000" }}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Initials badge bottom-left */}
            <div
              className="absolute bottom-3 left-4 inline-flex items-center justify-center w-10 h-10 font-display font-black text-white text-sm"
              style={{ backgroundColor: "var(--color-red)" }}
            >
              {member.initials}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col">


            {/* Name + flag */}
            <div className="flex items-start gap-3 mb-0.5">
              <h2
                className="font-display font-black uppercase text-white leading-none flex-1"
                style={{ fontSize: "clamp(1.4rem, 5vw, 1.8rem)" }}
              >
                {member.name}
              </h2>
              {flagCode && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://flagcdn.com/w40/${flagCode}.png`}
                  alt={member.nationality}
                  width={34}
                  height={25}
                  style={{ borderRadius: 3, flexShrink: 0, marginTop: 4 }}
                />
              )}
            </div>

            {/* Role */}
            <p
              className="font-display text-xs tracking-widest uppercase mb-4"
              style={{ color: "var(--color-red)" }}
            >
              {member.role}
            </p>

            <div className="mb-4" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />

            {/* Meta */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
              <MetaRow label="Hometown" value={member.hometown} />
              {member.nationality && <MetaRow label="Nationality" value={member.nationality} />}
            </div>

            {/* Bio */}
            {member.bio && (
              <>
                <div className="mb-4" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />
                <p
                  className="font-body leading-relaxed"
                  style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.65)" }}
                >
                  {member.bio}
                </p>
              </>
            )}

            <p
              className="font-display text-xs tracking-widest uppercase text-center mt-6 mb-1"
              style={{ color: "rgba(255,255,255,0.12)" }}
            >
              Tap outside to dismiss
            </p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-xs tracking-widest uppercase mb-0.5" style={{ color: "var(--color-gray-mid)" }}>
        {label}
      </p>
      <p className="font-body text-sm font-medium text-white">{value}</p>
    </div>
  );
}
