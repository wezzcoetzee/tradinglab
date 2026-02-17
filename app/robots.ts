import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/*.csv'] },
    sitemap: 'https://tradinglab.vip/sitemap.xml',
  };
}
