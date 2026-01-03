import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Import Inter and Outfit
import "./globals.css";

// Configure Inter (Body text)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Configure Outfit (Headings)
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreelancerShield", // Updated title
  description: "The ultimate tool for managing your freelance business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}

