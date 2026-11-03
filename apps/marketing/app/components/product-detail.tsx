import { ProductImage } from "./product-image";
const artwork = {
  preparation: "preparation",
  attachment: "attachment",
  relations: "relations",
  citizen: "publication",
  published: "publication",
} as const;
export function ProductDetail({
  alt,
  detail,
}: {
  src?: string;
  alt: string;
  detail: keyof typeof artwork;
}) {
  return (
    <div className={`product-detail illustration-detail detail-${detail}`}>
      <ProductImage src={`/illustrations/${artwork[detail]}.png`} alt={`Ilustrácia: ${alt}`} />
    </div>
  );
}
