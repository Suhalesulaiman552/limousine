import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al-Suhail Limousine Fleet",
  description: "Limousine & Transport Fleet Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}