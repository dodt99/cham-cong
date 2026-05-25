import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chấm công",
  description: "Bảng chấm công theo tuần",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
