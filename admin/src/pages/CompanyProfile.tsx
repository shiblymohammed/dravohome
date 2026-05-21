import { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/api';
import './CompanyProfile.css';

interface CompanyProfileData {
  id: number;
  name: string;
  tagline: string;
  about_text: string;
  mission: string;
  vision: string;
  hero_image: string | null;
  contact_email: string;
  contact_phone: string;
  address: string;
  instagram: string;
  facebook: string;
  linkedin: string;
}

const CompanyProfile = () => {
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const r = await apiClient.get('/settings/company-profile/');
      setProfile(r.data);
    } catch {
      // Create empty template if it fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await apiClient.patch('/settings/company-profile/', profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save company profile', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="company-profile-loading">Loading...</div>;
  }

  if (!profile) return null;

  return (
    <div className="cat-page animate-fadeIn company-profile-page">
      <div className="cat-header">
        <div className="cat-header-left">
          <h1 className="cat-title">Company Profile</h1>
        </div>
        <div className="cat-header-actions">
          <button
            className="btn-add-cat"
            onClick={handleSave}
            disabled={saving}
            style={{ minWidth: 120 }}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="promo-cards" style={{ maxWidth: 860 }}>
        {/* Core Details */}
        <div className="promo-card">
          <div className="promo-card-header">
            <div className="promo-card-icon promo-icon-alpha">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <div>
              <div className="promo-card-title">Core Details</div>
              <div className="promo-card-subtitle">Basic information about the company</div>
            </div>
          </div>
          <div className="promo-card-body">
            <div className="cat-form-group">
              <label className="cat-form-label">Company Name</label>
              <input 
                type="text" 
                className="cat-form-input" 
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
              />
            </div>
            <div className="cat-form-group">
              <label className="cat-form-label">Tagline</label>
              <input 
                type="text" 
                className="cat-form-input" 
                value={profile.tagline}
                onChange={e => setProfile({...profile, tagline: e.target.value})}
              />
            </div>
            <div className="cat-form-group">
              <label className="cat-form-label">About Us (Rich Text representation)</label>
              <textarea 
                className="cat-form-input" 
                rows={5}
                value={profile.about_text}
                onChange={e => setProfile({...profile, about_text: e.target.value})}
              />
            </div>
            <div className="hero-row">
              <div className="cat-form-group flex-1">
                <label className="cat-form-label">Mission</label>
                <textarea 
                  className="cat-form-input" 
                  rows={4}
                  value={profile.mission}
                  onChange={e => setProfile({...profile, mission: e.target.value})}
                />
              </div>
              <div className="cat-form-group flex-1">
                <label className="cat-form-label">Vision</label>
                <textarea 
                  className="cat-form-input" 
                  rows={4}
                  value={profile.vision}
                  onChange={e => setProfile({...profile, vision: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="promo-card">
          <div className="promo-card-header">
            <div className="promo-card-icon promo-icon-gamma">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <div className="promo-card-title">Contact Information</div>
              <div className="promo-card-subtitle">Public contact details and location</div>
            </div>
          </div>
          <div className="promo-card-body">
            <div className="hero-row">
              <div className="cat-form-group flex-1">
                <label className="cat-form-label">Email Address</label>
                <input 
                  type="email" 
                  className="cat-form-input" 
                  value={profile.contact_email}
                  onChange={e => setProfile({...profile, contact_email: e.target.value})}
                />
              </div>
              <div className="cat-form-group flex-1">
                <label className="cat-form-label">Phone Number</label>
                <input 
                  type="text" 
                  className="cat-form-input" 
                  value={profile.contact_phone}
                  onChange={e => setProfile({...profile, contact_phone: e.target.value})}
                />
              </div>
            </div>
            <div className="cat-form-group">
              <label className="cat-form-label">Headquarters Address</label>
              <textarea 
                className="cat-form-input" 
                rows={3}
                value={profile.address}
                onChange={e => setProfile({...profile, address: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="promo-card">
          <div className="promo-card-header">
            <div className="promo-card-icon promo-icon-beta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <div className="promo-card-title">Social Links</div>
              <div className="promo-card-subtitle">Connect your social media accounts</div>
            </div>
          </div>
          <div className="promo-card-body">
            <div className="cat-form-group">
              <label className="cat-form-label">Instagram URL</label>
              <input 
                type="url" 
                className="cat-form-input" 
                value={profile.instagram}
                onChange={e => setProfile({...profile, instagram: e.target.value})}
              />
            </div>
            <div className="cat-form-group">
              <label className="cat-form-label">Facebook URL</label>
              <input 
                type="url" 
                className="cat-form-input" 
                value={profile.facebook}
                onChange={e => setProfile({...profile, facebook: e.target.value})}
              />
            </div>
            <div className="cat-form-group">
              <label className="cat-form-label">LinkedIn URL</label>
              <input 
                type="url" 
                className="cat-form-input" 
                value={profile.linkedin}
                onChange={e => setProfile({...profile, linkedin: e.target.value})}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyProfile;
