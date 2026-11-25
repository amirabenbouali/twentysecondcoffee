import { timingSafeEqual } from "node:crypto";
import {
  claimWalletSyncJobs,
  completeWalletSync,
  retryWalletSync,
} from "@/lib/loyalty/db";
import {
  googleWalletConfigurationStatus,
  syncGoogleWalletObject,
} from "@/lib/loyalty/google-wallet";

export const dynamic = "force-dynamic";

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim() ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  if (secret.length < 32 || !safeEqual(authorization, `Bearer ${secret}`)) {
    return Response.json({ error: "Not authorised." }, { status: 401 });
  }

  const wallet = googleWalletConfigurationStatus();
  if (wallet.state !== "ready") {
    return Response.json(
      { error: "Google Wallet is not ready.", reason: wallet.state === "invalid" ? wallet.reason : "NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  try {
    const jobs = await claimWalletSyncJobs(20);
    let completed = 0;
    let deferred = 0;
    for (const job of jobs) {
      const result = await syncGoogleWalletObject(job);
      if (result.status === "failed") {
        await retryWalletSync(job.member_id, result.errorCode);
        deferred += 1;
      } else {
        await completeWalletSync(job.member_id);
        completed += 1;
      }
    }
    return Response.json({ claimed: jobs.length, completed, deferred });
  } catch {
    console.error("[wallet] scheduled_sync_failed");
    return Response.json({ error: "Wallet synchronization failed." }, { status: 503 });
  }
}
