import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Get the pdf_url from the data endpoint
  const dataRes = await fetch(`${API_BASE}/v1/catalogues/${slug}/data/`, { cache: 'no-store' });
  if (!dataRes.ok) return new NextResponse('Not found', { status: 404 });

  const data = await dataRes.json();
  if (!data.pdf_url) return new NextResponse('No PDF', { status: 404 });

  // Fetch the actual PDF and stream it back same-origin
  const pdfRes = await fetch(data.pdf_url, { cache: 'no-store' });
  if (!pdfRes.ok) return new NextResponse('PDF fetch failed', { status: 502 });

  const pdf = await pdfRes.arrayBuffer();

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
