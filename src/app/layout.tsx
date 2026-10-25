import type { Metadata, Viewport } from 'next';
import { Archivo, Space_Mono, Inter } from 'next/font/google';
import './globals.css';
import { PrivyProvider } from '@/components/providers/PrivyProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WrongNetworkModal } from '@/components/chain/WrongNetworkModal';
import { ToastProvider } from '@/components/ui/Toast';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['800', '900'],
  display: 'swap',
  variable: '--font-archivo',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-mono',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1237E8',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://graven.app'),
  title: 'Graven | Digital Graveyard for Dead Coins on Robinhood Chain',
  description:
    'A digital graveyard where dead tokens on Robinhood Chain get an afterlife. Bury dead tokens under real engraved gravestones and unlock shared ETH rewards.',
  icons: {
    icon: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
  openGraph: {
    title: 'Graven | Digital Graveyard on Robinhood Chain',
    description: 'Where dead tokens on Robinhood Chain get an afterlife.',
    images: ['/assets/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={{ colorScheme: 'dark' }}
      className={`${archivo.variable} ${spaceMono.variable} ${inter.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function shouldIgnore(err) {
                  var msg = String((err && (err.message || (err.reason && (err.reason.message || err.reason)))) || err || '');
                  return msg.indexOf('Embedded wallet') !== -1 || msg.indexOf('only available over HTTPS') !== -1;
                }
                window.addEventListener('unhandledrejection', function(e) {
                  if (shouldIgnore(e)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return true;
                  }
                }, true);
                window.addEventListener('error', function(e) {
                  if (shouldIgnore(e)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return true;
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-[100svh] bg-[#000000] text-white antialiased flex flex-col p-2 sm:p-6 lg:p-6 selection:bg-[#1237E8] selection:text-white">
        <PrivyProvider>
          <ToastProvider>
            <WrongNetworkModal />
            <div className="w-full max-w-[1280px] mx-auto framed-sheet flex flex-col min-h-[calc(100svh-16px)] sm:min-h-[calc(100svh-48px)]">
              <Navbar />
              <div className="flex-1 w-full bg-[#000000] flex flex-col text-white">
                {children}
              </div>
              <Footer />
            </div>
          </ToastProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
