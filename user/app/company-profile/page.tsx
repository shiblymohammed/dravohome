import { Metadata } from "next";
import { generateMetadata as genMeta } from "@/src/lib/seo/utils";
import CompanyProfileClient from "./CompanyProfileClient";

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: "Company Profile - DravoHome",
    description: "Learn more about DravoHome's vision, mission, and history.",
    url: "/company-profile",
    keywords: [
      "company profile",
      "about DravoHome",
      "vision",
      "mission",
    ],
  });
}

export default function CompanyProfilePage() {
  return (
    <main className="pt-20 bg-creme min-h-screen">
      <CompanyProfileClient />
    </main>
  );
}
