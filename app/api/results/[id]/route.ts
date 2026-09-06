import { NextResponse } from 'next/server';
import { getResultById, getResultIds } from '@/lib/results';

// The dataset is committed and static, so every transcript is prerendered at build time.
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getResultIds()).map((id) => ({ id }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getResultById(id);
  if (!result) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }
  return NextResponse.json(result);
}
