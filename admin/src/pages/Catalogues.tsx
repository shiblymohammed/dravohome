import { useState, useEffect, useRef } from 'react';
import apiClient from '../utils/api';
import './Catalogues.css';

interface Catalogue {
  id: number;
  name: string;
  slug: string;
  pdf_url: string | null;
  public_url: string;
  created_at: string;
  updated_at: string;
}

interface QRData {
  qr_code: string;
  public_url: string;
}

const Catalogues = () => {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);

  // Page modal
  const [modal, setModal] = useState<{ open: boolean; editing: Catalogue | null }>({ open: false, editing: null });
  const [name, setName] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR modal
  const [qrModal, setQrModal] = useState<{ open: boolean; data: QRData | null; name: string }>({ open: false, data: null, name: '' });
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => { fetchCatalogues(); }, []);

  const fetchCatalogues = async () => {
    try {
      setLoading(true);
      const r = await apiClient.get('/catalogues/');
      setCatalogues(Array.isArray(r.data) ? r.data : []);
    } catch { alert('Failed to load catalogues'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setName(''); setPdfFile(null); setModal({ open: true, editing: null }); };
  const openEdit = (c: Catalogue) => { setName(c.name); setPdfFile(null); setModal({ open: true, editing: c }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append('name', name);
      if (pdfFile) fd.append('pdf_file', pdfFile);

      const token = localStorage.getItem('token');
      const url = modal.editing
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/catalogues/${modal.editing.id}/`
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/catalogues/`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(modal.editing ? 'PUT' : 'POST', url);
        if (token) xhr.setRequestHeader('Authorization', `Token ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(xhr.responseText));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(fd);
      });

      closeModal();
      fetchCatalogues();
    } catch { alert('Failed to save'); }
    finally { setSaving(false); setUploadProgress(0); }
  };

  const remove = async (c: Catalogue) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try { await apiClient.delete(`/catalogues/${c.id}/`); fetchCatalogues(); }
    catch { alert('Failed to delete'); }
  };

  const showQR = async (c: Catalogue) => {
    setQrLoading(true);
    setQrModal({ open: true, data: null, name: c.name });
    try {
      const r = await apiClient.get(`/catalogues/${c.id}/qr/`);
      setQrModal({ open: true, data: r.data, name: c.name });
    } catch { alert('Failed to generate QR'); setQrModal({ open: false, data: null, name: '' }); }
    finally { setQrLoading(false); }
  };

  const downloadQR = (data: QRData, label: string) => {
    const a = document.createElement('a');
    a.href = data.qr_code;
    a.download = `qr-${label.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="cat-page animate-fadeIn">

      {/* Header */}
      <div className="cat-header">
        <div>
          <h1 className="cat-title">Catalogues</h1>
          <p className="cat-subtitle">{catalogues.length} page{catalogues.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="cat-btn-primary" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Page
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="cat-loading"><div className="cat-spinner" /><span>Loading…</span></div>
      ) : catalogues.length === 0 ? (
        <div className="cat-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>No catalogue pages yet</p>
          <button className="cat-btn-primary" onClick={openAdd}>Create first page</button>
        </div>
      ) : (
        <div className="cat-grid">
          {catalogues.map(cat => (
            <div key={cat.id} className="cat-card">
              <div className="cat-card-top">
                <div className={`cat-card-icon ${!cat.pdf_url ? 'cat-card-icon-empty' : ''}`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div className="cat-card-info">
                  <div className="cat-card-name">{cat.name}</div>
                  <div className="cat-card-meta">
                    {cat.pdf_url
                      ? <a href={cat.pdf_url} target="_blank" rel="noreferrer" className="cat-pdf-link">View PDF</a>
                      : <span className="cat-no-pdf">No PDF uploaded</span>
                    }
                    <span>· {fmt(cat.updated_at)}</span>
                  </div>
                </div>
              </div>
              <div className="cat-card-actions">
                <button className="cat-act-btn cat-act-qr" onClick={() => showQR(cat)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <path d="M14 14h.01M17 14h.01M20 14h.01M14 17h.01M17 17h.01M20 17h.01M14 20h.01M17 20h.01M20 20h.01"/>
                  </svg>
                  QR Code
                </button>
                <button className="cat-act-btn cat-act-edit" onClick={() => openEdit(cat)}>
                  {cat.pdf_url ? 'Edit' : 'Upload PDF'}
                </button>
                <button className="cat-act-btn cat-act-del" onClick={() => remove(cat)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Page Modal */}
      {modal.open && (
        <div className="cat-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="cat-modal">
            <div className="cat-modal-header">
              <h2 className="cat-modal-title">{modal.editing ? 'Edit Page' : 'New Catalogue Page'}</h2>
              <button className="cat-modal-close" onClick={closeModal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="cat-modal-body">
              <div className="cat-form-group">
                <label className="cat-form-label">Page Name</label>
                <input className="cat-form-input" type="text" placeholder="e.g. Living Room Collection"
                  value={name} onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && save()} autoFocus />
                <span className="cat-form-hint">Used in the QR code URL — won't change even if you replace the PDF.</span>
              </div>
              <div className="cat-form-group">
                <label className="cat-form-label">
                  PDF
                  {modal.editing && <span className="cat-form-hint"> — leave empty to keep current</span>}
                </label>
                <div className="cat-file-drop" onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: 'none' }}
                    onChange={e => setPdfFile(e.target.files?.[0] ?? null)} />
                  {pdfFile ? (
                    <div className="cat-file-selected">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span>{pdfFile.name}</span>
                      <button className="cat-file-clear" onClick={e => { e.stopPropagation(); setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>✕</button>
                    </div>
                  ) : (
                    <>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>Click to upload PDF</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="cat-modal-footer">
              {saving && pdfFile && (
                <div className="cat-upload-progress">
                  <div className="cat-upload-bar" style={{ width: `${uploadProgress}%` }} />
                  <span className="cat-upload-label">
                    {uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : 'Processing…'}
                  </span>
                </div>
              )}
              <div className="cat-modal-footer-btns">
                <button className="cat-btn-cancel" onClick={closeModal} disabled={saving}>Cancel</button>
                <button className="cat-btn-primary" onClick={save} disabled={saving || !name.trim()}>
                  {saving ? (pdfFile ? 'Uploading…' : 'Saving…') : modal.editing ? 'Update' : 'Create Page'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModal.open && (
        <div className="cat-overlay" onClick={e => { if (e.target === e.currentTarget) setQrModal({ open: false, data: null, name: '' }); }}>
          <div className="cat-modal cat-modal-qr">
            <div className="cat-modal-header">
              <h2 className="cat-modal-title">QR Code — {qrModal.name}</h2>
              <button className="cat-modal-close" onClick={() => setQrModal({ open: false, data: null, name: '' })}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="cat-modal-body cat-qr-body">
              {qrLoading ? (
                <div className="cat-loading"><div className="cat-spinner" /></div>
              ) : qrModal.data ? (
                <>
                  <div className="cat-qr-img-wrap">
                    <img src={qrModal.data.qr_code} alt="QR Code" className="cat-qr-img" />
                  </div>
                  <div className="cat-qr-info">
                    <p className="cat-qr-note">Stable URL — replacing the PDF won't break this QR.</p>
                    <div className="cat-qr-url">{qrModal.data.public_url}</div>
                  </div>
                </>
              ) : null}
            </div>
            {qrModal.data && (
              <div className="cat-modal-footer">
                <button className="cat-btn-cancel" onClick={() => setQrModal({ open: false, data: null, name: '' })}>Close</button>
                <button className="cat-btn-primary" onClick={() => downloadQR(qrModal.data!, qrModal.name)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Download QR
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogues;
