import {
  contexts,
  CTX_ID_GET_LIBRARY_COLLECTION_FROM_OPTIONS_DATA,
  CTX_ID_GET_LIBRARY_COLLECTION_FROM_RADIO
} from '../contextTree.js';
import { beniBook } from 'benibana_bookdata';
import { dispatch } from '../variable.js';
import { Prefecture } from 'benibana_bookdata/dist/CalilPrefecture.js';
import { strictTab, TabID, ISBN, Tab, TabsCache, TabData } from '../types';
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

/**
 * 書影検索
 * - ContextMenuクリックでCalil接続 + contentsに結果を送信
 * - ISBNがない場合は検索を実行しない
 * - 蔵書が図書館にない場合もからの情報をcontentsに送信
 */
export const clickContextMenuHandler = async (info, tab, tabs) => {
  const tabID = tab?.id;
  if (!tabID) return;

  // ISBNの有無を確認
  const isbn = tabs.get(tabID);
  if (!isbn) return;

  // CaliのオプションをInit
  const CALIL_KEY = '46a2412f4ceb07b72a251150f2533c74';
  const pollingDuration = 500;

  // ラジオボタンから検索する
  if (info.parentMenuItemId === CTX_ID_GET_LIBRARY_COLLECTION_FROM_RADIO) {
    // CalilAPIに接続し蔵書検索を実行
    const systemid = info.menuItemId as Prefecture;
    const res = await beniBook.searchLibraryCollections({
      appkey: CALIL_KEY,
      isbn,
      systemid,
      pollingDuration
    });
    const { libraryStock, reserveurl } = res;
    // 現在のタブのcontentに結果を送信
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    });

    if (!tab.id) return;
    await chrome.tabs.sendMessage(tab.id, {
      action: dispatch[1],
      payload: {
        systemid,
        reserveurl,
        libraryStock
      }
    });
    return;
  }

  // デフォルトで設定した地域から検索を実行
  if (info.menuItemId === CTX_ID_GET_LIBRARY_COLLECTION_FROM_OPTIONS_DATA) {
    chrome.storage.sync.get('value', async (val) => {
      // val を使用して検索を実行
      const res = await beniBook.searchLibraryCollections({
        appkey: CALIL_KEY,
        isbn,
        systemid: val.value,
        pollingDuration
      });
      const { libraryStock, reserveurl } = res;
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      });

      if (!tab.id) return;
      await chrome.tabs.sendMessage(tab.id, {
        action: dispatch[1],
        payload: {
          systemid: val.value,
          reserveurl,
          libraryStock
        }
      });
      return;
    });
    return;
  }

  // 予期せぬ要素がクリックされた場合はエラーとする
  console.log('INVALID ID WAS CLICKED !!!');
};
