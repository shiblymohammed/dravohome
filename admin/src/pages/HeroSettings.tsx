import { useState, useEffect, useCallback } from 'react';
import apiClient, { extractData } from '../utils/api';
import './HeroSettings.css';

interface HeroSlide {
  id: number;
  image: string | null;
  subtitle: string;
  title: string;
  title_emphasized: string;
  description: string;
  cta1_text: string;
  cta1_link: string;
  cta2_text: string;
  cta2_link: string;
  order: number;
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  image: string;
  selling_price: string;
  mrp: string;
  description: string;
}

interface HeroSettingsData {
  id: number;
  active_type: 'carousel' | 'trending_grid' | 'split_screen' | 'minimal_video';
  primary_heading: string;
  secondary_heading: string;
  description: string;
  background_video_url: string;
  cta_text: string;
  cta_link: string;
  featured_products: number[];
  featured_products_detail: Product[];
  slides: HeroSlide[];
}

const HeroSettings = () => {
  const [settings, setSettings] = useState<HeroSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'carousel' | 'trending_grid' | 'split_screen' | 'minimal_video'>('carousel');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<Partial<HeroSlide> | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const r = await apiClient.get('/settings/hero/');
      setSettings(r.data);
      setActiveTab(r.data.active_type);
    } catch {
      // Default state handled by backend
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await apiClient.get('/products/');
      setAllProducts(extractData(res.data));
    } catch (e) { console.error('Failed to fetch products'); }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, [fetchSettings, fetchProducts]);

  const addProduct = (product: Product) => {
    if (!settings) return;
    if (settings.featured_products.includes(product.id)) return;
    setSettings({
      ...settings,
      featured_products: [...settings.featured_products, product.id],
      featured_products_detail: [...settings.featured_products_detail, product],
    });
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const removeProduct = (productId: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      featured_products: settings.featured_products.filter(id => id !== productId),
      featured_products_detail: settings.featured_products_detail.filter(p => p.id !== productId),
    });
  };

  const handleEditSlide = (slide: HeroSlide) => {
    setCurrentSlide(slide);
    setSlideModalOpen(true);
  };

  const handleAddSlide = () => {
    setCurrentSlide({ id: Date.now(), title: '', subtitle: '', image: '', title_emphasized: '', description: '', cta1_text: 'Shop Now', cta1_link: '/products', cta2_text: 'View Lookbook', cta2_link: '/collections', order: settings?.slides.length || 0, is_active: true });
    setSlideModalOpen(true);
  };

  const handleRemoveSlide = async (slideId: number) => {
    if (!settings || !window.confirm('Are you sure you want to remove this slide?')) return;
    try {
      await apiClient.delete(`/settings/hero/slides/${slideId}/`);
      setSettings({
        ...settings,
        slides: settings.slides.filter(s => s.id !== slideId),
      });
    } catch (err) {
      console.error('Failed to delete slide', err);
      alert('Failed to delete slide.');
    }
  };

  const saveSlide = async () => {
    if (!settings || !currentSlide) return;
    try {
      if (settings.slides.some(s => s.id === currentSlide.id)) {
        // Update existing
        const res = await apiClient.patch(`/settings/hero/slides/${currentSlide.id}/`, currentSlide);
        const newSlides = settings.slides.map(s => s.id === currentSlide.id ? res.data : s);
        setSettings({ ...settings, slides: newSlides });
      } else {
        // Create new
        const res = await apiClient.post(`/settings/hero/slides/`, { ...currentSlide, id: undefined });
        setSettings({ ...settings, slides: [...settings.slides, res.data] });
      }
      setSlideModalOpen(false);
    } catch (err) {
      console.error('Failed to save slide', err);
      alert('Failed to save slide.');
    }
  };

  const filteredProducts = allProducts.filter(p =>
    !settings?.featured_products?.includes(p.id) &&
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await apiClient.patch('/settings/hero/', {
        active_type: activeTab,
        primary_heading: settings.primary_heading,
        secondary_heading: settings.secondary_heading,
        description: settings.description,
        background_video_url: settings.background_video_url,
        cta_text: settings.cta_text,
        cta_link: settings.cta_link,
        featured_products: settings.featured_products,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save hero settings', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="hero-settings-loading">Loading...</div>;
  }

  if (!settings) return null;

  return (
    <div className="cat-page animate-fadeIn hero-settings-page">
      <div className="cat-header">
        <div className="cat-header-left">
          <h1 className="cat-title">Hero Section Settings</h1>
        </div>
        <div className="cat-header-actions">
          <button
            className="btn-add-cat"
            onClick={handleSave}
            disabled={saving}
            style={{ minWidth: 120 }}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Active Hero'}
          </button>
        </div>
      </div>

      <div className="promo-cards" style={{ maxWidth: 860 }}>
        {/* Layout Selection Card */}
        <div className="promo-card">
          <div className="promo-card-header">
            <div className="promo-card-icon promo-icon-gamma">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
              </svg>
            </div>
            <div>
              <div className="promo-card-title">Hero Layout Style</div>
              <div className="promo-card-subtitle">Choose the visual layout for the storefront hero section</div>
            </div>
          </div>
          <div className="promo-card-body" style={{ padding: 0, gap: 0 }}>
            <div className="hero-tabs">
              <button 
                className={`hero-tab ${activeTab === 'carousel' ? 'active' : ''}`}
                onClick={() => setActiveTab('carousel')}
              >
                Cinematic Carousel
              </button>
              <button 
                className={`hero-tab ${activeTab === 'trending_grid' ? 'active' : ''}`}
                onClick={() => setActiveTab('trending_grid')}
              >
                Trending Grid
              </button>
              <button 
                className={`hero-tab ${activeTab === 'split_screen' ? 'active' : ''}`}
                onClick={() => setActiveTab('split_screen')}
              >
                Split Screen
              </button>
              <button 
                className={`hero-tab ${activeTab === 'minimal_video' ? 'active' : ''}`}
                onClick={() => setActiveTab('minimal_video')}
              >
                Minimal Video
              </button>
            </div>
          </div>
        </div>

        {/* Content Configuration Card */}
        <div className="promo-card">
          <div className="promo-card-header">
            <div className="promo-card-icon promo-icon-beta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div>
              <div className="promo-card-title">Content Configuration</div>
              <div className="promo-card-subtitle">
                Customize the content for {activeTab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
          </div>
          
          <div className="promo-card-body">
            {activeTab === 'carousel' && (
              <div className="hero-section">
                <p className="hero-help">This is the default multi-slide hero section with beautiful transitions.</p>
                
                <div className="hero-slides-list">
                  {settings.slides.map((slide, index) => (
                    <div key={slide.id} className="hero-slide-item">
                      <div className="slide-image-preview">
                        {slide.image ? <img src={slide.image} alt={slide.title} /> : <div className="no-image">No Image</div>}
                      </div>
                      <div className="slide-details">
                      <h4>{slide.title} {slide.title_emphasized}</h4>
                      <p>{slide.subtitle}</p>
                    </div>
                    <button className="btn-edit-slide" onClick={() => handleEditSlide(slide)}>Edit</button>
                    <button className="btn-edit-slide" style={{ borderColor: 'red', color: 'red' }} onClick={() => handleRemoveSlide(slide.id)}>Remove</button>
                  </div>
                ))}
                <button className="btn-add-slide" onClick={handleAddSlide}>+ Add New Slide</button>
              </div>
              </div>
            )}

            {(activeTab === 'trending_grid' || activeTab === 'split_screen' || activeTab === 'minimal_video') && (
              <div className="hero-section">
                
                <div className="cat-form-group">
                  <label className="cat-form-label">Primary Heading</label>
                  <input 
                    type="text" 
                    className="cat-form-input" 
                    value={settings.primary_heading}
                    onChange={e => setSettings({...settings, primary_heading: e.target.value})}
                  />
                </div>

                <div className="cat-form-group">
                  <label className="cat-form-label">Secondary Heading</label>
                  <input 
                    type="text" 
                    className="cat-form-input" 
                    value={settings.secondary_heading}
                    onChange={e => setSettings({...settings, secondary_heading: e.target.value})}
                  />
                </div>

                <div className="cat-form-group">
                  <label className="cat-form-label">Description</label>
                  <textarea 
                    className="cat-form-input" 
                    rows={3}
                    value={settings.description}
                    onChange={e => setSettings({...settings, description: e.target.value})}
                  />
                </div>

                <div className="hero-row">
                  <div className="cat-form-group flex-1">
                    <label className="cat-form-label">CTA Text</label>
                    <input 
                      type="text" 
                      className="cat-form-input" 
                      value={settings.cta_text}
                      onChange={e => setSettings({...settings, cta_text: e.target.value})}
                    />
                  </div>
                  <div className="cat-form-group flex-1">
                    <label className="cat-form-label">CTA Link</label>
                    <input 
                      type="text" 
                      className="cat-form-input" 
                      value={settings.cta_link}
                      onChange={e => setSettings({...settings, cta_link: e.target.value})}
                    />
                  </div>
                </div>

                {activeTab === 'minimal_video' && (
                  <div className="cat-form-group">
                    <label className="cat-form-label">Background Video URL</label>
                    <input 
                      type="url" 
                      className="cat-form-input" 
                      value={settings.background_video_url}
                      onChange={e => setSettings({...settings, background_video_url: e.target.value})}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                )}

                {(activeTab === 'trending_grid' || activeTab === 'split_screen') && (
                  <div className="cat-form-group">
                    <label className="cat-form-label">Featured Products</label>
                    <div className="featured-products-list">
                      {settings.featured_products_detail.map(p => (
                      <div key={p.id} className="featured-product-chip">
                        {p.image && <img src={p.image} alt={p.name} className="product-chip-img" />}
                        <span>{p.name}</span>
                        <button type="button" className="promo-chip-remove" onClick={() => removeProduct(p.id)}>&times;</button>
                      </div>
                    ))}
                  </div>
                  <div className="promo-search-wrap" style={{ marginTop: '12px' }}>
                    <svg className="promo-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input className="cat-form-input promo-search-input" type="text" placeholder="Search and add products…"
                      value={productSearch}
                      onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                      onFocus={() => setShowProductDropdown(true)}
                      onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)} />
                    {showProductDropdown && filteredProducts.length > 0 && (
                      <div className="promo-dropdown">
                        {filteredProducts.map(p => (
                          <button key={p.id} type="button" className="promo-dropdown-item" onMouseDown={() => addProduct(p)}>
                            {p.image && <img src={p.image} alt={p.name} className="product-chip-img" />}
                            <div>
                              <div className="promo-dropdown-name">{p.name}</div>
                              <div className="promo-dropdown-desc">{p.selling_price}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {showProductDropdown && productSearch && filteredProducts.length === 0 && (
                      <div className="promo-dropdown promo-dropdown-empty">No matching products found</div>
                    )}
                  </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {slideModalOpen && currentSlide && (
        <div className="cat-modal-overlay">
          <div className="cat-modal" style={{ maxWidth: 600 }}>
            <div className="cat-modal-header">
              <h2>{settings.slides.some(s => s.id === currentSlide.id) ? 'Edit Slide' : 'Add New Slide'}</h2>
              <button className="cat-modal-close" onClick={() => setSlideModalOpen(false)}>×</button>
            </div>
            <div className="cat-modal-body">
              <div className="cat-form-group">
                <label className="cat-form-label">Image URL</label>
                <input type="text" className="cat-form-input" value={currentSlide.image || ''} onChange={e => setCurrentSlide({...currentSlide, image: e.target.value})} placeholder="/hero/slide1.png" />
              </div>
              <div className="hero-row">
                <div className="cat-form-group flex-1">
                  <label className="cat-form-label">Title</label>
                  <input type="text" className="cat-form-input" value={currentSlide.title || ''} onChange={e => setCurrentSlide({...currentSlide, title: e.target.value})} />
                </div>
                <div className="cat-form-group flex-1">
                  <label className="cat-form-label">Emphasized Title (Gold)</label>
                  <input type="text" className="cat-form-input" value={currentSlide.title_emphasized || ''} onChange={e => setCurrentSlide({...currentSlide, title_emphasized: e.target.value})} />
                </div>
              </div>
              <div className="cat-form-group">
                <label className="cat-form-label">Subtitle / Kicker</label>
                <input type="text" className="cat-form-input" value={currentSlide.subtitle || ''} onChange={e => setCurrentSlide({...currentSlide, subtitle: e.target.value})} />
              </div>
              <div className="cat-form-group">
                <label className="cat-form-label">Description</label>
                <textarea className="cat-form-input" rows={2} value={currentSlide.description || ''} onChange={e => setCurrentSlide({...currentSlide, description: e.target.value})} />
              </div>
              <div className="hero-row">
                <div className="cat-form-group flex-1">
                  <label className="cat-form-label">CTA 1 Text</label>
                  <input type="text" className="cat-form-input" value={currentSlide.cta1_text || ''} onChange={e => setCurrentSlide({...currentSlide, cta1_text: e.target.value})} />
                </div>
                <div className="cat-form-group flex-1">
                  <label className="cat-form-label">CTA 1 Link</label>
                  <input type="text" className="cat-form-input" value={currentSlide.cta1_link || ''} onChange={e => setCurrentSlide({...currentSlide, cta1_link: e.target.value})} />
                </div>
              </div>
              <div className="hero-row">
                <div className="cat-form-group flex-1">
                  <label className="cat-form-label">CTA 2 Text</label>
                  <input type="text" className="cat-form-input" value={currentSlide.cta2_text || ''} onChange={e => setCurrentSlide({...currentSlide, cta2_text: e.target.value})} />
                </div>
                <div className="cat-form-group flex-1">
                  <label className="cat-form-label">CTA 2 Link</label>
                  <input type="text" className="cat-form-input" value={currentSlide.cta2_link || ''} onChange={e => setCurrentSlide({...currentSlide, cta2_link: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="cat-modal-footer">
              <button className="btn-cancel" onClick={() => setSlideModalOpen(false)}>Cancel</button>
              <button className="btn-save" onClick={saveSlide}>Save Slide</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HeroSettings;
