import './globals.css';

export const metadata = {
  title: 'Take Me Home | Jabbz, Tebza & Fresh Trip Tracker',
  description: 'Luxury Take Me Home & Chauffeur trip tracking app for Jabbz, Tebza, and Fresh with dynamic fleet rotation, live PDF voucher generation, and POPIA compliance.'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0b111e'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div id="mobile-app-shell">
          <main id="view-content" role="main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
