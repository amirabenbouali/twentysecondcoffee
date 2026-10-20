import { getPublicLoyaltyMember } from "@/lib/loyalty/db";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/loyalty/[code]/manifest">,
) {
  const { code } = await context.params;
  if (!/^[A-Za-z0-9_-]{24,64}$/.test(code)) {
    return Response.json({ error: "Card not found." }, { status: 404 });
  }

  const member = await getPublicLoyaltyMember(code).catch(() => null);
  if (!member) return Response.json({ error: "Card not found." }, { status: 404 });

  return Response.json(
    {
      id: `/loyalty/${member.public_code}`,
      name: `${member.first_name}'s Twenty Second Rewards card`,
      short_name: "Rewards card",
      description: "Your live twenty second coffee loyalty card.",
      start_url: `/loyalty/${member.public_code}`,
      scope: "/loyalty/",
      display: "standalone",
      background_color: "#faf6ef",
      theme_color: "#a51f1b",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "private, no-store",
      },
    },
  );
}
