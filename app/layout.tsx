import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { getPublicTenantInfo } from "@/lib/data/tenant";

export async function generateMetadata(): Promise<Metadata> {
  const tenantInfo = await getPublicTenantInfo();
  
  return {
    title: tenantInfo.tenantName || "Bursta Bugün",
    description: "Burs Yönetim ve İletişim Platformu",
    icons: {
      icon: tenantInfo.logoUrl || "/favicon.ico",
      apple: tenantInfo.logoUrl || "/apple-icon.png",
    }
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
