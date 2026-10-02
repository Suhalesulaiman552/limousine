import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Limousine Fleet Management",
  description: "Manage your transport and limousine fleet easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}