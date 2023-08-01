import { beniBook } from 'benibana_bookdata';
import { contexts, CTX_ID_GET_LIBRARY_COLLECTION } from './contextTree.js';
import { dispatch } from './variable.js';

/**
 * DOMから取得した文字列を保持する
 */
let isbn = '';
/**
 * isbn13を受け取り格納するハンドラー
 * - isbn13を受信成功したときのみ、ContextMenuを作成する
 * - isbnが存在しないときはContextMenuを作成しない
 */
const onMessageHandler = (request, sender, sendResponse) => {
  isbn = request['isbn13'];
  console.log('isbn', isbn);
  // isbnがある場合はContextMenuを作成
  if (isbn) {
    sendResponse('SUCCESS: SENDDING ISBN-13');
    contexts.forEach((ctx) => chrome.contextMenus.create(ctx));
  } else {
    sendResponse('NO ISBN-13');
    // TODO: ISBNがない旨をCOntextMenuに表示する
  }
};

/**
 * ContextMenuクリックでCalil接続 + contentsに結果を送信
 * - ISBNがない場合は検索を実行しない
 * - 蔵書が図書館にない場合もからの情報をcontentsに送信
 */
const contextClickHandler = async (info, tab) => {
  if (!isbn) return;
  // 書影取得など、今後 別機能を実装する際を見越して、ContextMenuでクリックされた要素ごとにswitchで分岐処理している
  switch (info.parentMenuItemId) {
    // 書影検索実行
    case CTX_ID_GET_LIBRARY_COLLECTION: {
      // CaliのオプションをInit
      const CALIL_KEY = '46a2412f4ceb07b72a251150f2533c74';
      const systemid = info.menuItemId;
      const pollingDuration = 500;
      // CalilAPIに接続し蔵書検索を実行
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
      await chrome.tabs.sendMessage(tab.id, {
        action: dispatch[1],
        payload: {
          systemid,
          reserveurl,
          libraryStock
        }
      });
      break;
    }

    // 予期せぬ要素がクリックされた場合はエラーとする
    default:
      console.log('INVALID ID WAS CLICKED !!!');
  }
};

/**
 * フロントにISBNの取得を依頼
 * - タブ切替時を検知したら、フロントに対してISBNを再送信するよう通知する
 * - Amazon.co.jp以外では不要のため実行しない.
 *  - workerは全てのページでタブ切り替えを検知するため、明示的に実行をキャンセルする必要あり
 * - タブ切替時に初期化する（ContextMenuを削除）
 */
const onTabActivated = async () => {
  chrome.contextMenus.removeAll();
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  });

  // AmazonページのみISBNの取得を依頼
  const isAmazonCoJp = new URL(tab.url).host.includes('www.amazon.co.jp');
  if (isAmazonCoJp) {
    await chrome.tabs.sendMessage(tab.id, {
      action: dispatch[0],
      payload: {} //payloadは指定していない
    });
  }
};

/**
 * インストール時に全てのタブをリロードし、content.jsを更新する。これを行わないとタブ切替時にworker側でコネクションが確立されずエラーとなるため
 */
chrome.runtime.onInstalled.addListener(async () => {
  const allTabs = await chrome.tabs.query({}); //全てのタブを指定：{}
  allTabs.forEach((tab) => {
    chrome.tabs.reload(tab.id);
  });
});

chrome.contextMenus.onClicked.addListener(contextClickHandler);
chrome.runtime.onMessage.addListener(onMessageHandler);
chrome.tabs.onActivated.addListener(onTabActivated);
