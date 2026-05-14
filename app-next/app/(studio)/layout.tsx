import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SensCode Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
