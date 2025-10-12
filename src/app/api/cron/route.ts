import { db } from "@/db";
import { business_pitches, investor_accounts, transactions } from "@/db/schema";
import { and, eq, inArray, lt, sql } from "drizzle-orm";

/*
 * This cron job runs every day at midnight UTC. It performs the following tasks:
 * start_date has passed and status is still "upcoming" -> set status to "active"
 * end_date has passed and status is still "active" -> set status to "failed"
 * refund all "pending" transactions related to the failed pitches
 * */
export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  await db.transaction(async (tx) => {

    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    console.log('Start of UTC day:', startOfDay.toISOString());

    await tx.update(business_pitches)
      .set({ status: "active" })
      .where(
        and(
          eq(business_pitches.status, "upcoming"),
          lt(business_pitches.start_date, startOfDay),
        )
      );

    const failedPitches = await tx.select().from(business_pitches).where(
      and(
        eq(business_pitches.status, "active"),
        lt(business_pitches.end_date, startOfDay),
      )
    )

    if (failedPitches.length === 0) return;

    const failedPitchIds = failedPitches.map((p) => p.instance_id);

    const pendingTxns = await tx
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.tnx_status, "pending"),
          inArray(transactions.related_pitch_id, failedPitchIds)
        )
      );

    for (const txn of pendingTxns) {
      await tx
        .update(investor_accounts)
        .set({
          wallet_balance: sql`${investor_accounts.wallet_balance} + ${txn.amount}`,
        })
        .where(eq(investor_accounts.id, txn.account_id));

      await tx
        .update(transactions)
        .set({
          tnx_status: "reversed",
          success: false,
          description: sql`concat(coalesce(description, ''), ' | auto-refunded due to failed pitch')`,
        })
        .where(eq(transactions.id, txn.id));
    }

    await tx
      .update(business_pitches)
      .set({ status: "failed" })
      .where(inArray(business_pitches.instance_id, failedPitchIds));
  });

  return new Response('Success', { status: 200 });
}
