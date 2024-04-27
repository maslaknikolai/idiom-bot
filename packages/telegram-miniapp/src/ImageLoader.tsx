import { useState } from "react";

export function ImageLoader({
  src,
  alt,
  fit
}: {
  src: string;
  alt: string
  fit?: "contain" | "cover";
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className={"w-full h-full object-" + (fit || "cover")}
        onLoad={() => setLoaded(true)}
        style={{
          display: loaded ? "block" : "none"
        }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ display: loaded ? "none" : "block" }}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-opacity-50 bg-orange-600"></div>
      </div>
    </div>
  );
}
