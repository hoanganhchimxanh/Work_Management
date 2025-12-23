import React from "react";

function ExampleCarouselImage({ src, alt, height = "500px" }) {
  return (
    <div
      style={{
        height,
        width: "100%",
        overflow: "hidden",
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}

export default ExampleCarouselImage;
