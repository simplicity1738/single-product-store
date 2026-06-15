import Image from "next/image";
import { isRemoteImageUrl } from "@/lib/image-url";
import { PRODUCT_IMAGE_FRAME_CLASS } from "@/lib/product-image-frame";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

export default function ProductImage({
  src,
  alt,
  className = "",
  fill,
  sizes,
  priority,
}: ProductImageProps) {
  const imageNode = isRemoteImageUrl(src) ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={
        fill
          ? `absolute inset-0 h-full w-full ${className}`
          : className
      }
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  ) : (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );

  if (fill) {
    return (
      <div className={`absolute inset-0 ${PRODUCT_IMAGE_FRAME_CLASS}`}>
        {imageNode}
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${PRODUCT_IMAGE_FRAME_CLASS}`}>
      {imageNode}
    </div>
  );
}
