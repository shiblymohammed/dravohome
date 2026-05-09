import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface CatalogueData {
  name: string;
  pdf_url: string | null;
}

async function getData(slug: string): Promise<CatalogueData | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/catalogues/${slug}/data/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return { title: 'Catalogue Not Found' };
  return {
    title: `${data.name} — DravoHome Catalogue`,
    description: `View and download the ${data.name} catalogue from DravoHome.`,
  };
}

export default async function CataloguePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getData(slug);

  if (!data) notFound();

  // Proxy URL — same-origin so browser renders it inline without CORS issues
  const proxyUrl = `/api/catalogue-pdf/${slug}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#f5f0e8', borderBottom: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo/logo_dark.png" alt="DravoHome" style={{ height: 22, width: 'auto', objectFit: 'contain' }} />
          <span style={{ width: 1, height: 18, background: 'rgba(0,0,0,0.15)' }} />
          <span style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '1rem', color: '#1a1a1a' }}>
            {data.name}
          </span>
        </div>
        {data.pdf_url && (
          <a
            href={proxyUrl}
            download={`${slug}.pdf`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#1a1a1a', color: '#f5f0e8', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', fontFamily: 'var(--font-inter), sans-serif' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Download
          </a>
        )}
      </div>

      {/* PDF — fills all remaining space */}
      <div style={{ flex: 1, overflow: 'hidden', background: '#e5e5e5' }}>
        {data.pdf_url ? (
          <object
            data={proxyUrl}
            type="application/pdf"
            style={{ width: '100%', height: '100%', display: 'block' }}
            aria-label={data.name}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: '#888' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.875rem', margin: 0 }}>
                Your browser can&apos;t preview PDFs inline.
              </p>
              <a
                href={proxyUrl}
                target="_blank"
                rel="noreferrer"
                style={{ padding: '10px 20px', background: '#1a1a1a', color: '#f5f0e8', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}
              >
                Open PDF
              </a>
            </div>
          </object>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#aaa' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.875rem', margin: 0 }}>Catalogue coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
