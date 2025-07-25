import React from 'react';
import './globals.css'
import {Providers} from "./providers";

export const metadata = {
  title: 'Engram Compute',
  description: 'Biological computing',
  metadataBase: new URL('https://engramcompute.com'),
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