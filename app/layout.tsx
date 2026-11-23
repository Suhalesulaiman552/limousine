import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al-Suhail Limousine Fleet",
  description: "Limousine & Transport Fleet Management System",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased bg-slate-950 text-white min-h-full flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}