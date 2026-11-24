import type { Metadata } from "next";
import StaffDashboard from "@/components/loyalty/StaffDashboard";
import StaffLogin from "@/components/loyalty/StaffLogin";
import { getStaffSession, isStaffAuthConfigured } from "@/lib/loyalty/auth";
import { isLoyaltyDatabaseConfigured, searchLoyaltyMembers } from "@/lib/loyalty/db";

export const metadata: Metadata = {
  title: "Staff loyalty desk | twenty second coffee",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StaffLoyaltyPage() {
  const configured = isStaffAuthConfigured() && isLoyaltyDatabaseConfigured();
  const staff = configured ? await getStaffSession() : null;

  return (
    <section className="min-h-screen bg-[#f5efe3] px-5 pb-20 pt-32 text-ink-950 sm:px-8 sm:pt-36 lg:px-10">
      {!configured ? (
        <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-ink-950/15 bg-paper-50 p-7 sm:p-10">
          <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-cherry-700">Setup required</p>
          <h1 className="mt-4 font-display text-5xl leading-none tracking-[-0.035em]">Connect the loyalty desk.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-ink-900/58">Add the four loyalty environment variables and run the included database migration before using customer cards. The setup steps are documented in the project README.</p>
        </div>
      ) : staff ? (
        <div className="mx-auto max-w-6xl">
          <StaffDashboard initialPage={await searchLoyaltyMembers(staff.id)} staff={staff} />
        </div>
      ) : (
        <StaffLogin />
      )}
    </section>
  );
}
