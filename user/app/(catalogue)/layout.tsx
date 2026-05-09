// Catalogue pages render without the site navbar/footer
// Root layout still provides html/body/providers
export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
