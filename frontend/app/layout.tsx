import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { ToastProvider } from "@/providers/toast-provider";
import { AuthProvider } from "./utils/authContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: [
    {
      url: "/logo.jpeg",
      href: "/logo.jpeg",
    },
  ],
  openGraph: {
    images: [
      {
        url: "/logo.jpeg",
        alt: "Logo",
      },
    ],
  },
  metadataBase: new URL("https://4kay.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactQueryProvider>
      <html lang="en">
        <body className={inter.className}>
          <AuthProvider>
            <ToastProvider />
            {children}
          </AuthProvider>
        </body>
      </html>
    </ReactQueryProvider>
  );
}
