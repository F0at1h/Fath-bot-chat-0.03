"use client";

import Link from "next/link";

const menuItems = [
  { href: "/", label: "Chat" },
  { href: "/edit-foto", label: "Edit Foto" },
  { href: "/generate-video", label: "Generate Video" },
  { href: "/generate-ppt", label: "Buat PPT" },
];

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        gap: 16,
        padding: "12px 20px",
        borderBottom: "1px solid #333",
        overflowX: "auto",
        whiteSpace: "nowrap",
      }}
    >
      {menuItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          style={{ textDecoration: "none", color: "inherit", fontWeight: 500 }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}