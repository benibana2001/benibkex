export const isAmazonPage = (url) => url.includes('amazon.co.jp');
export const isAmazonItemPage = (url) =>
  url?.split('/').includes('dp') && isAmazonPage(url);
