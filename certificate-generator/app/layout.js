import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { themeInitScript } from "@/lib/theme";

export const metadata = {
  title: "مولّد الشهادات",
  description: "اعمل شهادات لكل المشاركين دفعة وحدة من ملف Excel",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#151310" },
  ],
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: لأنه themeInitScript بيضيف class="dark" قبل ما React يشتغل
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Cairo: للعناوين وجوّا الشهادة نفسها (canvas) — IBM Plex Sans Arabic: لنصوص الواجهة */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
