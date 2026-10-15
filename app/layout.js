import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Portal Janji Senyum Rekah - Klinik Gigi",
  description: "Aplikasi Janji Temu dan Catatan Perawatan Klinik Gigi Senyum Rekah Semarang",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-rekah-bg text-rekah-text min-h-screen flex flex-col font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-rekah-muted">
            &copy; 2026 Klinik Gigi Senyum Rekah · janji.senyumrekah.id
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
