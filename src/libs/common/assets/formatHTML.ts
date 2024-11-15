import * as cheerio from 'cheerio';

export const formatHTML = (htmlText: string) => {
  if (!htmlText?.length) return null;

  return cheerio
    .load(htmlText)
    ?.html()
    ?.replaceAll('<html><head></head><body>', '')
    ?.replaceAll('</body></html>', '');
};
