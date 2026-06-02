import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chronoshift — Rewrite History",
  description: "Pick a moment. Change one thing. See what happens. Generate narrated alternate history documentaries.",
  openGraph: {
    title: "Chronoshift — Rewrite History",
    description: "Pick a moment. Change one thing. See what happens.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="grain-overlay antialiased">
        {children}
      </body>
    </html>
  );
}
