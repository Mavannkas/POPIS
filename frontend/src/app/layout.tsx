import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POPIS - Hackathon Boilerplate",
  description: "A blazingly fast full-stack boilerplate for hackathons",
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
