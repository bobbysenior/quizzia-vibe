import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quizz — Créez, partagez, apprenez",
  description:
    "Créez des quizz intelligents générés par IA, partagez-les et mesurez vos progrès. Simple, rapide, sans friction.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav userEmail={user?.email} />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-line-2 py-12 px-8 mt-20 text-[13px] text-muted">
          <div className="max-w-[1200px] mx-auto flex justify-between items-center flex-wrap gap-4">
            <span>© 2026 Quizia</span>
              <nav className="flex gap-6">
              <a href="/" className="hover:text-ink transition-colors">Découvrir</a>
              <a href="/quizzes" className="hover:text-ink transition-colors">Catalogue</a>
              <a href="/my-quizzes" className="hover:text-ink transition-colors">Mes quiz</a>
              <a href="/mentions-legales" className="hover:text-ink transition-colors">Mentions légales</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
