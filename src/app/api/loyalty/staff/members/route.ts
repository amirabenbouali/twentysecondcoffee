import { isStaffAuthenticated } from "@/lib/loyalty/auth";
import { listLoyaltyMembers } from "@/lib/loyalty/db";

export async function GET() {
  if (!(await isStaffAuthenticated())) {
    return Response.json({ error: "Staff sign-in required." }, { status: 401 });
  }

  try {
    const members = await listLoyaltyMembers();
    return Response.json({ members });
  } catch (error) {
    console.error("Unable to list loyalty members", error);
    return Response.json(
      { error: "Customer cards could not be loaded." },
      { status: 500 },
    );
  }
}
