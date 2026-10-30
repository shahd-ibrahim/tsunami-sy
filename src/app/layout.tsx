import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { UserRoleProvider } from "@/components/UserRoleContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "تسونامي | TSUNAMI - منصة شحن الألعاب والتطبيقات الرقمية",
  description: "بوابتك المباشرة لشحن سول ستار، سول شيل، وبطاقات الألعاب الرقمية بأمان وسرعة.",
  keywords: [
    "شحن كوينز سول ستار",
    "SoulStar Coins",
    "سول شيل",
    "SoulChill Diamonds",
    "شدات ببجي",
    "شحن فري فاير",
    "شام كاش",
    "بطاقات رقمية سوريا",
    "شايا سوفت",
    "SHAYA SOFT",
    "تسوق ألعاب سوريا",
  ],
  authors: [{ name: "شايا سوفت | SHAYA SOFT", url: "https://shayasoft.com" }],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://tsunami-sy.com/#organization",
        "name": "منصة تسونامي للخدمات الرقمية وشحن الألعاب",
        "alternateName": "TSUNAMI Platform",
        "url": "https://tsunami-sy.com",
        "logo": "https://tsunami-sy.com/images/logo.png",
        "description": "المنصة الأولى والأسرع في سوريا والشرق الأوسط لشحن كوينز سول ستار، سول شيل، شدات ببجي، فري فاير، وخدمات شام كاش.",
        "founder": {
          "@type": "Organization",
          "name": "شايا سوفت | SHAYA SOFT"
        },
        "sameAs": [
          "https://t.me/tsunami_sy",
          "https://wa.me/963911223344"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://tsunami-sy.com/#website",
        "url": "https://tsunami-sy.com",
        "name": "منصة تسونامي",
        "publisher": {
          "@id": "https://tsunami-sy.com/#organization"
        }
      },
      {
        "@type": "Store",
        "@id": "https://tsunami-sy.com/#store",
        "name": "متجر تسونامي الرقمي",
        "description": "شحن فوري ومباشر لبطاقات الألعاب وكوينز التطبيقات في سوريا وتركيا والشرق الأوسط.",
        "currenciesAccepted": "USD, SYP, TRY",
        "paymentAccepted": "Sham Cash, Al-Haram, Ziraat Bank, USDT (TRC20)",
        "priceRange": "$$"
      }
    ]
  };

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} dark`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('tsunami_theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070e17] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#06b6d4]/30 selection:text-white transition-colors duration-300">
        <ThemeProvider>
          <UserRoleProvider>
            {children}
            <Toaster
              position="top-left"
              dir="rtl"
              toastOptions={{
                className: "font-sans",
              }}
            />
          </UserRoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
