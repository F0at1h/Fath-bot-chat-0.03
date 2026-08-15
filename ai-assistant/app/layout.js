import "./globals.css";

export const metadata = {
  title: "AI Assistant Sendiri",
  description: "Chat AI buatan sendiri, gratis",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
