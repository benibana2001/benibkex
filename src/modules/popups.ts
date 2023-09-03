import { strictTab, TabID, ISBN, Tab, TabsCache, TabData } from '../types';
import { isAmazonPage, isAmazonItemPage } from '../util';
export async function activatePopup(tab: strictTab, tabs: TabsCache) {
  // TODO:Staticなファイルしかよめない。どうやってHTML内部を柔軟に対応する？
  chrome.action.setPopup({ popup: './popup.html' }, () => {
    console.log('setPopup');

    // Amazon以外のページ
    if (!isAmazonPage(tab.url)) {
      console.log('This is not amazon.co.jp');
      return;
    }
    if (!isAmazonItemPage(tab.url)) {
      console.log('This is AmazonPage, but NOT ITEM PAGE');
      return;
    }

    const cachedISBN = tabs.get(tab.id);
    if (!cachedISBN) {
      console.log('This is AmazonItemPage, but NO ISBN ⚠️ ');
    } else {
      console.log('This is AmazonItemPage with ISBN ✅');
    }
  });
}
