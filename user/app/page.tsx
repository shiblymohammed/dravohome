import { Metadata } from 'next';
import Hero from "@/src/components/homepage/Hero";
import ShopByRoom from "@/src/components/homepage/ShopByRoom";
import CollectionsSection from "@/src/components/homepage/CollectionsSection";
import BestSellers from "@/src/components/homepage/BestSellers";
import InstagramFeed from "@/src/components/homepage/InstagramFeed";
import MaterialsShowcase from "@/src/components/homepage/MaterialsShowcase";
import HotSelling from "@/src/components/homepage/HotSelling";
import Categories from "@/src/components/homepage/Categories";
import Offers from "@/src/components/homepage/Offers";
import AboutSection from "@/src/components/homepage/AboutSection";
import BlogSection from "@/src/components/homepage/BlogSection";
import Testimonial from "@/src/components/homepage/Testimonial";
import { generateMetadata as genMeta } from '@/src/lib/seo/utils';
import { generateOrganizationSchema } from '@/src/lib/seo/structured-data';
import Script from 'next/script';
import { ApiClient } from '@/src/lib/api/client';

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: 'Premium Furniture for Your Home',
    description: 'Discover premium furniture collections for every room. Shop bestsellers, hot-selling items, and exclusive collections at DravoHome. Transform your space with quality furniture and home decor.',
    url: '/',
    keywords: ['furniture', 'home decor', 'premium furniture', 'furniture store', 'home furnishing', 'modern furniture', 'contemporary furniture', 'living room furniture', 'bedroom furniture', 'dining furniture'],
  });
}

export default async function HomePage() {
  const organizationSchema = generateOrganizationSchema();
  const heroSettings = await ApiClient.getHeroSettings().catch(() => null);

  return (
    <>
      <Script
        id="org-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div className="relative bg-creme">
        <Hero settings={heroSettings} />
        <div className="relative">
          <BestSellers />
          <Categories />
          <ShopByRoom />
          <CollectionsSection />
          <HotSelling />
          <InstagramFeed />
          <MaterialsShowcase />
          <Offers />
          <AboutSection />
          <BlogSection />
          <Testimonial />
        </div>
      </div>
    </>
  );
}
