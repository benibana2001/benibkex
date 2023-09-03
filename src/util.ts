import { contexts } from './contextTree.js';
import { strictTab, TabID, ISBN, Tab, TabsCache, TabData } from './types';
export const isAmazonPage = (url) => url.includes('amazon.co.jp');
export const isAmazonItemPage = (url) =>
  url?.split('/').includes('dp') && isAmazonPage(url);

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
 * タブの初期化 :
 * - ISBNをタブのキャッシュにセットする
 * - すでに存在する場合は上書きする
 * - ISBNが画面から取得できない場合は終了する
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

  // ISBNが更新された場合はた場合は更新する
  if (tabs.get(tab.id) !== request['isbn13']) {
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
  // ContextMenuを一度削除する
  chrome.contextMenus.removeAll();

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
      console.log('This is AmazonItemPage, but NO ISBN ⚠️ ');
    } else {
      console.log('This is AmazonItemPage with ISBN ✅');
    }
  });
}

/**
 * タブの情報をstorageに保存する
 * @param id
 * @param tabData
 */
export const addTabData = async (
  id: TabID,
  tabData: TabData
): Promise<void> => {
  const cached = await chrome.storage.local.get();
  const cachedTabs = cached.tabs;

  await chrome.storage.local.set({
    tabs: {
      ...cachedTabs,
      [id]: tabData
    }
  });
};

/**
 * Tabの情報を取得する
 * @param id
 * @returns
 */
export const getTabData = async (id: TabID): Promise<TabData | null> => {
  const cached = await chrome.storage.local.get();
  return cached.tabs[id] || null;
};

/**
 * すべてのstorageデータを消去する
 * - install/uninstall時に実行しないと、古いデータが残り続けてしまう
 */
export const clearTabData = async () => {
  await chrome.storage.local.clear();
};

export const getAllStorageData = async () => {
  return await chrome.storage.local.get();
};
