"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Headset, CreditCard, Play } from "lucide-react";
import Link from "next/link";
import {
  ProductCard,
  ProductCardImageContainer,
  ProductCardImage,
  ProductCardTitle,
  ProductCardPrice,
} from "../ui/ProductCard";

function HeroProductCard({ product }: { product: any }) {
  const mainImage = product.image || (product.images && product.images.length > 0
    ? product.images[0].url 
    : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&auto=format&fit=crop');

  const applicableOffers = product.applicable_offers || [];
  const bestOffer = applicableOffers.length > 0 ? applicableOffers[0] : null;
  const hasOffer = !!bestOffer;

  return (
    <ProductCard href={`/product/${product.slug}`} hasOffer={hasOffer} className="h-full">
      <ProductCardImageContainer className="aspect-[4/5] overflow-hidden rounded-2xl">
        <ProductCardImage src={mainImage} alt={product.name} className="object-cover w-full h-full" />
      </ProductCardImageContainer>
      
      <div className="flex flex-col items-start px-2 py-3 md:py-4 bg-white/40 backdrop-blur-md rounded-b-2xl">
        <ProductCardTitle className="text-sm md:text-base font-medium text-alpha">{product.name}</ProductCardTitle>
        <div className="mt-2 w-full">
          <ProductCardPrice 
            price={product.selling_price || product.price} 
            mrp={product.mrp} 
            hasOffer={hasOffer} 
            offerPercentage={bestOffer?.discount_percentage} 
          />
        </div>
      </div>
    </ProductCard>
  );
}

const fallbackSlides = [
  {
    id: 1,
    image: "/hero/slide1.png",
    subtitle: "New Arrival Collection",
    title: "ELEVATE YOUR",
    titleEmphasized: "LIVING SPACE",
    description: "Discover premium furniture that seamlessly blends timeless design with uncompromising comfort for your modern home.",
    cta1_text: "Shop Now", cta1_link: "/products",
    cta2_text: "View Lookbook", cta2_link: "/collections",
  },
  {
    id: 2,
    image: "/hero/slide2.png",
    subtitle: "Timeless Aesthetics",
    title: "MODERN",
    titleEmphasized: "SILENCE",
    description: "Curated pieces that speak volumes through minimalist forms and exquisite materials.",
    cta1_text: "Explore Collection", cta1_link: "/collections",
    cta2_text: "Best Sellers", cta2_link: "/products?sort=best-selling",
  },
  {
    id: 3,
    image: "/hero/slide3.png",
    subtitle: "Uncompromising Quality",
    title: "CRAFTED FOR",
    titleEmphasized: "ETERNITY",
    description: "Experience the epitome of luxury with our hand-crafted, sustainably sourced furniture.",
    cta1_text: "Our Story", cta1_link: "/about",
    cta2_text: "Shop All", cta2_link: "/products",
  }
];

const trustBadges = [
  { icon: Truck, text: "Free Shipping" },
  { icon: ShieldCheck, text: "10-Year Warranty" },
  { icon: Headset, text: "24/7 Support" },
  { icon: CreditCard, text: "Secure Payments" },
];

export default function Hero({ settings }: { settings?: any }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "30vh"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const activeType = settings?.active_type || 'carousel';
  const slides = settings?.slides?.length > 0 ? settings.slides : fallbackSlides;

  // Auto-play for carousel
  useEffect(() => {
    if (activeType !== 'carousel' || isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, activeType, slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const textItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  const renderTrustBadges = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className={`absolute bottom-6 md:bottom-10 left-0 w-full z-20 hidden lg:flex justify-center px-12 ${activeType !== 'carousel' ? 'lg:justify-start' : ''}`}
    >
      <div className={`bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${activeType !== 'carousel' ? 'bg-alpha border-alpha shadow-xl' : ''}`}>
        <div className="flex justify-center items-center gap-8 xl:gap-12">
          {trustBadges.map((badge, idx) => (
            <div key={idx} className={`flex items-center gap-3 font-semibold cursor-default transition-colors ${activeType !== 'carousel' ? 'text-creme hover:text-white' : 'text-creme/90 hover:text-white'}`}>
              <div className={`p-2 rounded-full shadow-inner ${activeType !== 'carousel' ? 'bg-creme/10' : 'bg-white/10 border border-white/5'}`}>
                <badge.icon className="w-4 h-4 text-gold" strokeWidth={2.5} />
              </div>
              <span className="text-xs uppercase tracking-widest">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  if (activeType === 'minimal_video') {
    return (
      <section ref={containerRef} className="relative h-[100svh] w-full overflow-hidden bg-alpha">
        <motion.div style={{ y, opacity }} className="absolute inset-0 z-0 origin-center">
          {settings?.background_video_url ? (
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src={settings.background_video_url} type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full bg-alpha flex items-center justify-center text-creme/50">No video configured</div>
          )}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </motion.div>
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl lg:text-[7rem] font-inter font-black text-white tracking-tighter mb-6 drop-shadow-2xl">
            {settings?.primary_heading || 'MINIMAL ELEGANCE'}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg md:text-xl text-creme/90 max-w-2xl mb-12 font-medium">
            {settings?.description || 'Curated pieces for a calm and sophisticated environment.'}
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <Link href={settings?.cta_link || '/products'} className="inline-flex items-center gap-3 bg-white text-alpha px-10 py-5 rounded-full text-sm font-bold tracking-widest hover:scale-105 transition-transform uppercase shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              <Play className="w-4 h-4" fill="currentColor" />
              {settings?.cta_text || 'Watch Video'}
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  if (activeType === 'trending_grid') {
    return (
      <section ref={containerRef} className="relative pt-32 pb-20 w-full overflow-hidden bg-creme px-6 md:px-12 lg:px-20">
        <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="w-full lg:w-1/2 flex flex-col items-start z-10">
            <span className="text-alpha/70 text-sm font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-gold block rounded-full"></span>
              {settings?.secondary_heading || 'Trending Now'}
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-inter font-black text-alpha tracking-tighter leading-[1.1] mb-6">
              {settings?.primary_heading || 'FEATURED COLLECTION'}
            </h1>
            <p className="text-alpha/80 text-lg mb-10 max-w-md">
              {settings?.description || 'Discover our most sought-after pieces, blending exquisite craftsmanship with unparalleled comfort.'}
            </p>
            <Link href={settings?.cta_link || '/products'} className="bg-alpha text-white px-8 py-4 rounded-full text-sm font-bold tracking-widest hover:bg-alpha/90 transition-all uppercase">
              {settings?.cta_text || 'Shop Collection'}
            </Link>
            <div className="mt-16 w-full hidden lg:block">
              {renderTrustBadges()}
            </div>
          </div>
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 md:gap-6 z-10 relative">
            {settings?.featured_products_detail?.slice(0, 4).map((product: any, idx: number) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={idx % 2 === 1 ? 'mt-12' : ''}>
                <HeroProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (activeType === 'split_screen') {
    return (
      <section ref={containerRef} className="relative h-[100svh] w-full overflow-hidden bg-white flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
          {settings?.featured_image ? (
            <Image src={settings.featured_image} alt="Hero" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-stone-200" />
          )}
        </div>
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-creme relative z-10">
          <span className="text-alpha/60 text-xs font-bold uppercase tracking-[0.2em] mb-4">
            {settings?.secondary_heading || 'Featured Design'}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-inter font-black text-alpha tracking-tight leading-[1] mb-6">
            {settings?.primary_heading || 'THE ESSENCE OF MINIMALISM'}
          </h1>
          <p className="text-alpha/80 text-base mb-8 max-w-md">
            {settings?.description || 'Our signature collection reimagines classic silhouettes with modern sensibilities.'}
          </p>
          <div className="flex gap-4">
            <Link href={settings?.cta_link || '/products'} className="bg-gold text-white px-8 py-3.5 rounded-full text-sm font-bold tracking-widest hover:bg-gold/90 transition-all uppercase shadow-lg">
              {settings?.cta_text || 'Shop Now'}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Default: Carousel
  return (
    <section 
      ref={containerRef} 
      className="relative h-[100svh] w-full overflow-hidden bg-alpha"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-0 origin-center"
          style={{ y, opacity }}
        >
          <Image 
            src={slides[currentSlide]?.image || '/hero/slide1.png'} 
            alt={slides[currentSlide]?.title || 'Hero slide'} 
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-alpha/90 via-alpha/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-alpha/80 via-transparent to-alpha/20" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 md:px-16 lg:px-24">
        <div className="w-full max-w-[1920px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
              }}
              className="flex flex-col items-start text-left max-w-xl lg:max-w-3xl mt-12 md:mt-0"
            >
              <motion.span variants={textItem} className="text-creme/90 text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                <span className="w-8 h-[2px] bg-gold block rounded-full"></span>
                {slides[currentSlide]?.subtitle}
              </motion.span>
              
              <h1 className="text-creme font-inter font-black tracking-tighter flex flex-col mb-6">
                <motion.span variants={textItem} className="text-5xl md:text-7xl lg:text-[6.5rem] leading-[0.95] drop-shadow-lg">
                  {slides[currentSlide]?.title}
                </motion.span>
                <motion.span variants={textItem} className="text-5xl md:text-7xl lg:text-[6.5rem] leading-[0.95] text-gold mt-2 drop-shadow-lg">
                  {slides[currentSlide]?.title_emphasized || slides[currentSlide]?.titleEmphasized}
                </motion.span>
              </h1>

              <motion.p variants={textItem} className="text-creme/80 text-base md:text-lg mb-10 font-medium leading-relaxed max-w-lg drop-shadow-md">
                {slides[currentSlide]?.description}
              </motion.p>

              <motion.div variants={textItem} className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <Link 
                  href={slides[currentSlide]?.cta1_link || '/products'} 
                  className="w-full sm:w-auto text-center bg-creme text-alpha px-8 py-4 rounded-full text-sm font-bold tracking-widest hover:bg-white transition-all shadow-xl hover:-translate-y-1 uppercase"
                >
                  {slides[currentSlide]?.cta1_text || 'Shop Now'}
                </Link>
                <Link 
                  href={slides[currentSlide]?.cta2_link || '/collections'} 
                  className="w-full sm:w-auto text-center bg-white/10 backdrop-blur-md border border-white/20 text-creme px-8 py-4 rounded-full text-sm font-bold tracking-widest hover:bg-white/20 transition-all shadow-xl hover:-translate-y-1 uppercase"
                >
                  {slides[currentSlide]?.cta2_text || 'View Lookbook'}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {renderTrustBadges()}

      <div className="absolute right-6 md:right-16 bottom-8 md:bottom-12 z-30 flex items-center gap-6">
        <div className="hidden md:flex gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 p-2 rounded-full shadow-xl">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="relative h-2 transition-all duration-500 ease-out rounded-full overflow-hidden"
              style={{ width: currentSlide === idx ? '2rem' : '0.5rem' }}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div className="absolute inset-0 bg-white/20" />
              {currentSlide === idx && (
                <motion.div 
                  layoutId="activeSlideIndicator"
                  className="absolute inset-0 bg-creme"
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 6, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={prevSlide}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-creme shadow-xl hover:bg-white/20 hover:scale-105 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <button 
            onClick={nextSlide}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-creme shadow-xl hover:bg-white/20 hover:scale-105 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
