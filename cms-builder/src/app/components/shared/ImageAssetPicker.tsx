import { useEffect, useMemo, useState } from 'react';
import { Check, Image as ImageIcon, Loader2, Search, Upload, X } from 'lucide-react';
import { backendApi } from '../../api/backend';
import type { ApiAsset } from '../../api/types';

interface ImageAssetPickerProps {
  open: boolean;
  title: string;
  initialAltEn?: string;
  initialAltAr?: string;
  initialUrl?: string;
  onClose: () => void;
  onSelect: (asset: ApiAsset, altEn: string, altAr: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageAssetPicker({
  open,
  title,
  initialAltEn = '',
  initialAltAr = '',
  initialUrl = '',
  onClose,
  onSelect,
}: ImageAssetPickerProps) {
  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [usageFilter, setUsageFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAltEn, setUploadAltEn] = useState(initialAltEn);
  const [uploadAltAr, setUploadAltAr] = useState(initialAltAr);
  const [libraryAltEn, setLibraryAltEn] = useState(initialAltEn);
  const [libraryAltAr, setLibraryAltAr] = useState(initialAltAr);

  useEffect(() => {
    if (!open) return;
    setUploadAltEn(initialAltEn);
    setUploadAltAr(initialAltAr);
    setLibraryAltEn(initialAltEn);
    setLibraryAltAr(initialAltAr);
    setSearch('');
    setUsageFilter('all');
    setUploadFile(null);
    setUploadError('');
    setTab('library');
    setSelectedId(null);
  }, [open, initialAltEn, initialAltAr, initialUrl]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    backendApi.listAssets()
      .then((response) => {
        if (!mounted) return;
        const images = response.filter((asset) => asset.type === 'image');
        setAssets(images);
        const current = images.find((asset) => asset.url === initialUrl) ?? null;
        setSelectedId(current?.id ?? images[0]?.id ?? null);
        if (current) {
          setLibraryAltEn(current.altEn || initialAltEn);
          setLibraryAltAr(current.altAr || initialAltAr);
        }
      })
      .catch(() => {
        if (mounted) setAssets([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [open, initialUrl, initialAltEn, initialAltAr]);

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesSearch = !query
        || asset.filename.toLowerCase().includes(query)
        || asset.altEn.toLowerCase().includes(query)
        || asset.altAr.toLowerCase().includes(query);
      const matchesUsage = usageFilter === 'all'
        || (usageFilter === 'used' && asset.usedInPages.length > 0)
        || (usageFilter === 'unused' && asset.usedInPages.length === 0);
      return matchesSearch && matchesUsage;
    });
  }, [assets, search, usageFilter]);

  const selectedAsset = selectedId ? assets.find((asset) => asset.id === selectedId) ?? null : null;

  async function handleUpload() {
    if (!uploadFile) return;
    try {
      setUploading(true);
      setUploadError('');
      const asset = await backendApi.uploadAsset(uploadFile, uploadAltEn.trim(), uploadAltAr.trim());
      setAssets((previous) => [asset, ...previous.filter((item) => item.id !== asset.id)]);
      onSelect(asset, uploadAltEn.trim(), uploadAltAr.trim());
      onClose();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleUseSelected() {
    if (!selectedAsset) return;
    onSelect(selectedAsset, libraryAltEn.trim() || selectedAsset.altEn, libraryAltAr.trim() || selectedAsset.altAr);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(1180px, 100%)',
          maxHeight: '90vh',
          overflow: 'hidden',
          borderRadius: 18,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 28px 80px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(196,127,23,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <ImageIcon size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{title}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Pick an existing image from the library or upload a new one.</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, padding: 16, minHeight: 0, flex: 1 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setTab('library')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: '1px solid var(--border)',
                  background: tab === 'library' ? 'var(--primary)' : 'transparent',
                  color: tab === 'library' ? '#fff' : 'var(--foreground)',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Choose from library
              </button>
              <button
                onClick={() => setTab('upload')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: '1px solid var(--border)',
                  background: tab === 'upload' ? 'var(--primary)' : 'transparent',
                  color: tab === 'upload' ? '#fff' : 'var(--foreground)',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Upload new image
              </button>
            </div>

            {tab === 'library' ? (
              <>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search assets…"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 34px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'var(--input-background)',
                      color: 'var(--foreground)',
                      outline: 'none',
                      fontSize: 12,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: `All (${assets.length})` },
                    { key: 'used', label: 'Used in pages' },
                    { key: 'unused', label: 'Unused' },
                  ].map((option) => {
                    const active = usageFilter === option.key;
                    return (
                      <button
                        key={option.key}
                        onClick={() => setUsageFilter(option.key as typeof usageFilter)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 999,
                          border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                          background: active ? 'rgba(196,127,23,0.10)' : 'transparent',
                          color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                          cursor: 'pointer',
                          fontSize: 11,
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ flex: 1, minHeight: 0, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 14, background: 'var(--muted)', padding: 12 }}>
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, color: 'var(--muted-foreground)', gap: 8 }}>
                      <Loader2 size={16} className="animate-spin" />
                      Loading media library…
                    </div>
                  ) : filteredAssets.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, color: 'var(--muted-foreground)', textAlign: 'center', fontSize: 12 }}>
                      {search ? 'No matching images found.' : 'No uploaded images yet. Upload one to start building your library.'}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
                      {filteredAssets.map((asset) => {
                        const selected = asset.id === selectedId;
                        return (
                          <button
                            key={asset.id}
                            onClick={() => {
                              setSelectedId(asset.id);
                              setLibraryAltEn(asset.altEn || initialAltEn);
                              setLibraryAltAr(asset.altAr || initialAltAr);
                              onSelect(asset, asset.altEn || initialAltEn, asset.altAr || initialAltAr);
                              onClose();
                            }}
                            style={{
                              padding: 0,
                              border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                              borderRadius: 12,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              background: 'var(--card)',
                              boxShadow: selected ? '0 0 0 3px rgba(196,127,23,0.10)' : 'none',
                              textAlign: 'left',
                            }}
                          >
                            <div style={{ aspectRatio: '16 / 10', background: 'var(--muted)' }}>
                              <img
                                src={asset.thumbnailUrl}
                                alt={asset.altEn || asset.filename}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                loading="lazy"
                              />
                            </div>
                            <div style={{ padding: 10 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.filename}</div>
                              <div style={{ marginTop: 4, fontSize: 10, color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {asset.altEn || 'No alt text'}
                              </div>
                              <div style={{ marginTop: 6, fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'DM Mono, monospace' }}>
                                {formatBytes(asset.sizeBytes)}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, minHeight: 0, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 14, background: 'var(--muted)', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const file = event.dataTransfer.files?.[0];
                    if (file) setUploadFile(file);
                  }}
                  style={{
                    border: `2px dashed ${uploadFile ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 14,
                    background: 'var(--card)',
                    minHeight: 220,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 10,
                    cursor: 'pointer',
                    textAlign: 'center',
                    padding: 18,
                  }}
                >
                  <Upload size={24} style={{ color: 'var(--primary)' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
                    {uploadFile ? uploadFile.name : 'Drop an image here or click to browse'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                    Uploaded files are automatically added to the media library.
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) setUploadFile(file);
                      event.target.value = '';
                    }}
                  />
                </label>

                <div style={{ display: 'grid', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Alt text (EN)
                    </label>
                    <input
                      value={uploadAltEn}
                      onChange={(event) => setUploadAltEn(event.target.value)}
                      placeholder="Describe the image in English"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        background: 'var(--input-background)',
                        color: 'var(--foreground)',
                        outline: 'none',
                        fontSize: 12,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Alt text (AR)
                    </label>
                    <input
                      value={uploadAltAr}
                      onChange={(event) => setUploadAltAr(event.target.value)}
                      placeholder="صف الصورة بالعربية"
                      dir="rtl"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        background: 'var(--input-background)',
                        color: 'var(--foreground)',
                        outline: 'none',
                        fontSize: 12,
                        boxSizing: 'border-box',
                        direction: 'rtl',
                        fontFamily: 'serif',
                      }}
                    />
                  </div>
                </div>

                {uploadError && (
                  <div style={{ fontSize: 11, color: '#B91C1C', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '8px 10px' }}>
                    {uploadError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    onClick={onClose}
                    style={{
                      padding: '9px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--foreground)',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!uploadFile || uploading}
                    style={{
                      padding: '9px 14px',
                      borderRadius: 10,
                      border: 'none',
                      background: !uploadFile || uploading ? 'var(--muted)' : 'var(--primary)',
                      color: !uploadFile || uploading ? 'var(--muted-foreground)' : '#fff',
                      cursor: !uploadFile || uploading ? 'not-allowed' : 'pointer',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {uploading && <Loader2 size={14} className="animate-spin" />}
                    Upload and use
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ width: 360, flexShrink: 0, border: '1px solid var(--border)', borderRadius: 14, background: 'var(--card)', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Selected image</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', marginTop: 4 }}>
                {selectedAsset?.filename || 'No image selected'}
              </div>
            </div>
            {selectedAsset ? (
              <>
                <div style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--muted)' }}>
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.altEn || selectedAsset.filename}
                    style={{ width: '100%', maxHeight: 230, objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Alt text (EN)
                    </label>
                    <input
                      value={libraryAltEn}
                      onChange={(event) => setLibraryAltEn(event.target.value)}
                      placeholder="English alt text"
                      style={{
                        width: '100%',
                        padding: '9px 11px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        background: 'var(--input-background)',
                        color: 'var(--foreground)',
                        outline: 'none',
                        fontSize: 12,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Alt text (AR)
                    </label>
                    <input
                      value={libraryAltAr}
                      onChange={(event) => setLibraryAltAr(event.target.value)}
                      placeholder="النص البديل بالعربية"
                      dir="rtl"
                      style={{
                        width: '100%',
                        padding: '9px 11px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        background: 'var(--input-background)',
                        color: 'var(--foreground)',
                        outline: 'none',
                        fontSize: 12,
                        boxSizing: 'border-box',
                        direction: 'rtl',
                        fontFamily: 'serif',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, color: 'var(--muted-foreground)' }}>
                  <div>Type: image</div>
                  <div>Size: {formatBytes(selectedAsset.sizeBytes)}</div>
                  {selectedAsset.width ? <div>Dimensions: {selectedAsset.width} × {selectedAsset.height}px</div> : null}
                  {selectedAsset.usedInPages.length > 0 ? <div>Used in {selectedAsset.usedInPages.length} page(s)</div> : <div>Not used yet</div>}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={handleUseSelected}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'var(--primary)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Use selected image
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'center', padding: 18 }}>
                Select an image from the library or upload a new one to continue.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
