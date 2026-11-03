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
  const illustration = src.startsWith("/illustrations");
  const showcase = src.startsWith("/showcase");
  const image = (
    <Image
      className={`product-image ${className}`}
      src={src}
      alt={alt}
      width={illustration ? 1536 : showcase ? 1280 : 1440}
      height={illustration ? 1024 : showcase ? 800 : 1040}
      sizes="(max-width: 767px) 100vw, (max-width: 1200px) 80vw, 1000px"
      preload={priority}
    />
  );
  return illustration ? <div className="illustration-art">{image}</div> : image;
}
