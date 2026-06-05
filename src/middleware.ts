import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Supported locales
  locales: ['en', 'fr', 'de', 'es', 'it'],
  // Default locale for unmatched paths
  defaultLocale: 'en',
  // Locale prefix is always visible (e.g. /en/about)
  localePrefix: 'always',
});

export const config = {
  // Match all pathnames except for:
  // - /api routes
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - static files (favicon, images, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
