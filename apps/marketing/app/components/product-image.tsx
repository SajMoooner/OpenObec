import Image from "next/image";
export function ProductImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const showcase = src.startsWith("/showcase");
  return (
    <Image
      className={`product-image ${className}`}
      src={src}
      alt={alt}
      width={showcase ? 1280 : 1440}
      height={showcase ? 800 : 1040}
      sizes="(max-width: 767px) 100vw, (max-width: 1200px) 80vw, 1000px"
      preload={priority}
    />
  );
}
