import { beniBook } from 'benibana_bookdata';
import {
  contexts,
  CTX_ID_GET_LIBRARY_COLLECTION_FROM_OPTIONS_DATA,
  CTX_ID_GET_LIBRARY_COLLECTION_FROM_RADIO
} from './contextTree.js';
import { dispatch } from './variable.js';
import { Prefecture } from 'benibana_bookdata/dist/CalilPrefecture.js';

/**
 * tabIDとISBNのマップ
 */
type TabID = number;
type ISBN = string | '' | undefined;
const tabs: Map<TabID, ISBN> = new Map();

/**
 * isbn13を受け取り格納するハンドラー
 * - isbnが存在しないときはContextMenuを作成しない
 */
chrome.runtime.onMessage.addListener(async (request, { tab }, sendResponse) => {
  chrome.contextMenus.removeAll();

  /**
   * ISBNをセット
   */
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

  // 送信元のTabIDと現在のTabIDが同じ場合は、ゼロからContextMenuを作る
  const [currentTab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  });
  if (currentTab.id === tab.id) {
    console.log('UPDATE Context Menu');
    contexts.forEach((ctx) => chrome.contextMenus.create(ctx));
  }

  // TODO: ISBNがない旨をpopupに表示する
});

/**
 * 書影検索
 * - ContextMenuクリックでCalil接続 + contentsに結果を送信
 * - ISBNがない場合は検索を実行しない
 * - 蔵書が図書館にない場合もからの情報をcontentsに送信
 */

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
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
  }

  // 予期せぬ要素がクリックされた場合はエラーとする
  console.log('INVALID ID WAS CLICKED !!!');
});

/**
 * Tabを初期化
 *
 * - ContextMenu作成
 */
// ACTIVATEDのときはISBNをstateから取得してメニュー作成
chrome.tabs.onActivated.addListener(async () => {
  // ContextMenuを一度削除する
  chrome.contextMenus.removeAll();

  // tab取得
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  });
  // ページにtab情報が存在しがない場合は終了
  if (!tab.url || !tab.id) return;
  // TabIDを保持していなかったら新規で追加
  if (tabs.get(tab.id) === undefined) {
    console.log('create new tab');
    tabs.set(tab.id, '');
    return;
  }

  // ISBNがない場合は終了する
  if (!tabs.get(tab.id)) return;

  //ContextMenuを作成
  console.log('CREATE NEW Context Menu');
  contexts.forEach((ctx) => chrome.contextMenus.create(ctx));
});

/**
 * インストール時にタブIDを取得。Amazonページのみタブをリロード、あるいはどうにかしてcontent.jsを実行.
 */
chrome.runtime.onInstalled.addListener(async () => {
  const allTabs = await chrome.tabs.query({}); //全てのタブを指定：{}
  // 全てのTabIDを取得する
  allTabs.forEach((tab) => {
    if (!tab.id) return;
    tabs.set(tab.id, '');
    // Amazonの商品ページか判定し、リロードを実行して強制的にcontent.jsを実行させる.ISBNを送信させる
    const isAmazonItemPage =
      tab.url?.split('/').includes('dp') && tab.url.includes('amazon.co.jp');
    if (isAmazonItemPage) chrome.tabs.reload(tab.id);
  });
});

// タブ削除イベント
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabs.get(tabId)) tabs.delete(tabId);
  console.log('TAB REMOVED');
  console.log('tabId', tabId);
  console.log('tabs', tabs);
});
