import React from 'react';
import './globals.css'
import {Providers} from "./providers";

export const metadata = {
  title: 'Nanoneuro',
  description: 'Creating energy efficient AI chips using human brain cells',
  metadataBase: new URL('https://nanoneuro.systems'),
  openGraph: {
    images: '/opengraph-image.png',
  },
}

export default function RootLayout({ children } : { children: React.ReactNode }) {
  return (
    <html lang="en" className='dark'>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}