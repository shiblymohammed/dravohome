"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

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

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function CompanyProfileClient() {
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const heroAnim = useInView(0.05);
  const storyAnim = useInView(0.08);
  const ctaAnim = useInView(0.1);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
        const res = await fetch(`${apiUrl}/settings/company-profile/`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load company profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <p className="text-alpha/50 uppercase tracking-widest text-sm font-primary">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════
          HERO — Clean, minimal fullscreen
          ═══════════════════════════════════════════════ */}
      <section ref={heroAnim.ref} className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[70vh] flex items-end overflow-hidden bg-alpha">
        <div className="absolute inset-0">
          {profile.hero_image ? (
            <Image
              src={profile.hero_image}
              alt={profile.name}
              fill
              className={`object-cover transition-all duration-[2.5s] ease-[cubic-bezier(0.22,1,0.36,1)] ${heroAnim.visible ? 'scale-100' : 'scale-105'}`}
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-alpha" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-alpha/90 via-alpha/40 to-alpha/10" />
        </div>

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 md:px-12 pb-12 md:pb-20 text-center md:text-left">
          <span className={`block text-[10px] md:text-xs font-primary uppercase tracking-[0.3em] text-creme/60 mb-4 transition-all duration-1000 delay-300 ${heroAnim.visible ? 'opacity-100' : 'opacity-0'}`}>
            Company Profile
          </span>
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-secondary text-creme leading-[1.1] tracking-tight max-w-3xl transition-all duration-[1.2s] delay-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${heroAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {profile.name}
          </h1>
          {profile.tagline && (
            <p className={`mt-6 text-lg md:text-xl text-creme/80 font-primary font-light max-w-2xl transition-all duration-[1.2s] delay-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${heroAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {profile.tagline}
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ABOUT TEXT — Elegant Text Section
          ═══════════════════════════════════════════════ */}
      <section className="bg-creme border-b border-alpha/10">
        <div ref={storyAnim.ref} className="max-w-[1000px] mx-auto px-4 md:px-12 py-20 md:py-32">
          <div className={`transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] text-center ${storyAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className={`text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/40 mb-6 block transition-all duration-1000 delay-300 ${storyAnim.visible ? 'opacity-100' : 'opacity-0'}`}>
              Who We Are
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-secondary text-alpha leading-[1.2] tracking-tight mb-12">
              Our <em className="font-light not-italic text-alpha/60">Story</em>
            </h2>

            <div className="space-y-6 text-base md:text-lg font-primary text-alpha/70 leading-[1.8] max-w-3xl mx-auto whitespace-pre-wrap text-left">
              {profile.about_text || "Our story goes here..."}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MISSION & VISION — Split Layout
          ═══════════════════════════════════════════════ */}
      <section className="bg-creme border-b border-alpha/10">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-alpha/10">
          <div className="px-8 py-20 md:p-24 lg:p-32 flex flex-col items-center text-center">
             <span className="text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/40 mb-6 block">
              Our Mission
            </span>
            <p className="text-lg md:text-xl lg:text-2xl font-secondary text-alpha leading-[1.6] max-w-lg italic">
              "{profile.mission || "Our mission statement"}"
            </p>
          </div>
          <div className="px-8 py-20 md:p-24 lg:p-32 flex flex-col items-center text-center bg-white/50">
             <span className="text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/40 mb-6 block">
              Our Vision
            </span>
            <p className="text-lg md:text-xl lg:text-2xl font-secondary text-alpha leading-[1.6] max-w-lg italic">
              "{profile.vision || "Our vision statement"}"
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CONTACT CTA — Clean
          ═══════════════════════════════════════════════ */}
      <section ref={ctaAnim.ref} className="bg-alpha text-center py-24 md:py-32 px-4">
        <div className={`transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] ${ctaAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="text-[10px] font-primary uppercase tracking-[0.3em] text-creme/40 mb-5 block">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-secondary text-creme leading-tight mb-12">
            Connect With <em className="font-light not-italic text-creme/60">Us</em>
          </h2>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-12 max-w-4xl mx-auto">
             {profile.contact_email && (
               <div>
                 <span className="block text-[10px] font-primary uppercase tracking-[0.2em] text-creme/50 mb-2">Email</span>
                 <a href={`mailto:${profile.contact_email}`} className="text-lg text-creme hover:text-white transition-colors">
                   {profile.contact_email}
                 </a>
               </div>
             )}
             {profile.contact_phone && (
               <div>
                 <span className="block text-[10px] font-primary uppercase tracking-[0.2em] text-creme/50 mb-2">Phone</span>
                 <a href={`tel:${profile.contact_phone}`} className="text-lg text-creme hover:text-white transition-colors">
                   {profile.contact_phone}
                 </a>
               </div>
             )}
          </div>

          {profile.address && (
             <div className="mt-12">
               <span className="block text-[10px] font-primary uppercase tracking-[0.2em] text-creme/50 mb-2">Headquarters</span>
               <p className="text-base text-creme max-w-md mx-auto whitespace-pre-wrap">
                 {profile.address}
               </p>
             </div>
          )}

          <div className="flex justify-center gap-6 mt-16">
            {profile.instagram && (
              <a href={profile.instagram} target="_blank" rel="noreferrer" className="text-creme/60 hover:text-creme transition-colors text-sm uppercase tracking-widest font-primary">Instagram</a>
            )}
            {profile.facebook && (
              <a href={profile.facebook} target="_blank" rel="noreferrer" className="text-creme/60 hover:text-creme transition-colors text-sm uppercase tracking-widest font-primary">Facebook</a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-creme/60 hover:text-creme transition-colors text-sm uppercase tracking-widest font-primary">LinkedIn</a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
