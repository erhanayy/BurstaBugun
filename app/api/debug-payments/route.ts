import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const p = await db.query.payments.findMany({
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit: 2,
      with: {
        fund: true,
      }
    });
    return NextResponse.json({ payments: p });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
