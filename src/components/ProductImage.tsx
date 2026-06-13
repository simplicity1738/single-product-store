import Image from "next/image";
import { isRemoteImageUrl } from "@/lib/image-url";

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
  if (isRemoteImageUrl(src)) {
    const remoteClassName = fill
      ? `absolute inset-0 h-full w-full ${className}`
      : className;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={remoteClassName}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
