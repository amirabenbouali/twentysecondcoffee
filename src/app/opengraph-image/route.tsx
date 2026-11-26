import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

export async function GET() {
  const [storefront, logo] = await Promise.all([
    readFile(join(process.cwd(), "public", "contact-storefront.jpeg")),
    readFile(join(process.cwd(), "public", "logo-small.png")),
  ]);

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#FAF6EF", color: "#1C1613" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 650, padding: 64, borderTop: "12px solid #A51F1B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={`data:image/png;base64,${logo.toString("base64")}`} width={68} height={58} alt="" style={{ objectFit: "contain" }} />
          <span style={{ color: "#A51F1B", fontSize: 24, letterSpacing: 4 }}>ROYAL WHARF · LONDON</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 72, lineHeight: 1.03, letterSpacing: -4, marginTop: 20 }}>
          <span>Twenty Second</span>
          <span>Coffee</span>
        </div>
        <span style={{ fontSize: 26, marginTop: 30 }}>Your neighbourhood café</span>
      </div>
      {/* ImageResponse renders JSX to an image and requires a plain img. */}
      <img src={`data:image/jpeg;base64,${storefront.toString("base64")}`} width={550} height={630} alt="" style={{ objectFit: "cover", objectPosition: "center" }} />
    </div>,
    size,
  );
}
