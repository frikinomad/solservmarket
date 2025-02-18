"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  if (pathname === "/") return null; // Hide navbar on home page

  return <Navbar />;
}
