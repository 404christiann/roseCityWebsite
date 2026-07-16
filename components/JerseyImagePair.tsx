import Image from "next/image";

const SHOP_IMAGE_BASE =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/shop`;

const jerseyImages = [
  {
    src: `${SHOP_IMAGE_BASE}/Robert%20Mejia%20Rose%20City%20FC%20Thorn%20jersey%20front%20crop.png`,
    alt: "Rose City Thorn Edition match kit, front view",
    transform: "translateX(7%)",
  },
  {
    src: `${SHOP_IMAGE_BASE}/Robert%20Mejia%20Rose%20City%20FC%20Thorn%20jersey%20back%20white.png`,
    alt: "Rose City Thorn Edition match kit, back view",
    transform: "translateX(-7%)",
  },
];

interface JerseyImagePairProps {
  sizes: string;
  priority?: boolean;
}

export default function JerseyImagePair({ sizes, priority = false }: JerseyImagePairProps) {
  return (
    <div className="grid h-full w-full grid-cols-2">
      {jerseyImages.map((image) => (
        <div key={image.src} className="relative h-full min-w-0">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-contain object-bottom"
            sizes={sizes}
            priority={priority}
            style={{ transform: image.transform }}
          />
        </div>
      ))}
    </div>
  );
}
