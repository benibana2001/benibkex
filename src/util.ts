import {
  contexts,
  CTX_ID_GET_LIBRARY_COLLECTION_FROM_OPTIONS_DATA,
  CTX_ID_GET_LIBRARY_COLLECTION_FROM_RADIO
} from './contextTree.js';
export const isAmazonPage = (url) => url.includes('amazon.co.jp');
export const isAmazonItemPage = (url) =>
  url?.split('/').includes('dp') && isAmazonPage(url);

/**
 * idとurlプロパティをTabに強制する
 * もとはoptional
 */
/**
 * タブを取得
 * タブのID, またはURLがない場合はnullを返す
 */
export const getActiveTab = async (): Promise<strictTab | null> => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  });

  return !tab || !tab.url || !tab.id ? null : (tab as strictTab);
};
/**
 * tabIDとISBNのマップ
 */
export type strictTab = Tab & { id: number; url: string };
export type TabID = number;
export type ISBN = string | '' | undefined;
export type Tab = chrome.tabs.Tab;
export type TabsCache = Map<TabID, ISBN>;
/**
 * タブの初期化
 * ISBNをセットする
 */
export const initializeTabWithISBN = (
  tab: Tab | undefined,
  tabs: TabsCache,
  request: any
): void => {
  //ISBNをセット
  // タブがない場合はreturn
  if (!tab || !tab.id) return;

  // タブを未保持の場合はセットする
  if (tabs.get(tab.id) === undefined) {
    tabs.set(tab.id, '');
  }

  // ISBNがない場合は終了
  if (!request['isbn13']) {
    return;
  }

  // tabID, ISBNを保存する
  tabs.set(tab.id, request['isbn13']);

  // isbnが取得でき,かつタブIDが更新された場合はた場合は更新する
  if (request['isbn13'] && tabs.get(tab.id) !== request['isbn13']) {
    tabs.set(tab.id, request['isbn13']);
  }
};

/**
 * tabsに格納されたtabid, isbnをもとにContextMenuを作成する
 * tab, ISBNをもしも保持していなかったら終了
 */
export async function createContextMenuFromTabsCache(
  tab: strictTab,
  tabs: TabsCache
) {
  // TabIDを保持していなかったら新規で追加
  if (tabs.get(tab.id) === undefined) {
    console.log('set new tab id');
    tabs.set(tab.id, '');
    return;
  }

  // ISBNがない場合は終了する
  if (!tabs.get(tab.id)) return;

  //ContextMenuを作成
  console.log('CREATE NEW Context Menu');
  contexts.forEach((ctx) => chrome.contextMenus.create(ctx));
}

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
      console.log('This is AmazonItemPage, but NO CACHE 📖❎');
    } else {
      console.log('This is AmazonItemPage with ISBN 😀');
    }
  });
}
