import { beniBook } from 'benibana_bookdata';
import { contexts, CTX_ID_GET_LIBRARY_COLLECTION } from './contextTree.js';

/**
 * DOMから取得した文字列を保持する
 */
let isbn = '';
/**
 * isbn13を受け取り格納するハンドラー
 *
 * isbn13を受信成功したときのみ、ContextMenuを作成
 *
 * @param {*} request
 * @param {*} sender
 * @param {*} sendResponse
 */
const onMessageHandler = (request, sender, sendResponse) => {
  console.log(
    sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension'
  );
  isbn = request['isbn13'];
  console.log('isbn', isbn);
  if (isbn) {
    sendResponse('SUCCESS: SENDDING ISBN-13');
  } else {
    sendResponse('NO ISBN-13');
  }
};

const contextClickHandler = async (info, tab) => {
  console.log('info', info);
  // 書影取得など、今後 別機能を実装する際を見越して、ContextMenuでクリックされた要素ごとにswitchで分岐処理している
  switch (info.parentMenuItemId) {
    // 書影検索実行
    case CTX_ID_GET_LIBRARY_COLLECTION: {
      /**
       * Init Calil Options
       */
      const CALIL_KEY = '46a2412f4ceb07b72a251150f2533c74';
      const systemid = info.menuItemId;
      const pollingDuration = 500;
      const res = await beniBook.searchLibraryCollections({
        appkey: CALIL_KEY,
        isbn,
        systemid,
        pollingDuration
      });
      const { libraryStock, reserveurl } = res;
      /**
       * contentに結果を送信
       */
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      });

      await chrome.tabs.sendMessage(tab.id, {
        reserveurl,
        libraryStock
      });
      break;
    }

    /**
     * 予期せぬ要素がクリックされた場合はエラーとする
     */
    default:
      console.log('INVALID ID WAS CLICKED !!!');
  }
};

/**
 * GET処理実行時
 */
chrome.contextMenus.onClicked.addListener(contextClickHandler);

/**
 * インストール時, ChromeUpdate時
 * CF: https://developer.chrome.com/docs/extensions/mv3/service_workers/service-worker-lifecycle/#oninstalled
 */
chrome.runtime.onInstalled.addListener(
  contexts.forEach((ctx) => chrome.contextMenus.create(ctx))
);

/**
 * contentからISBNを受診した際に動作
 */
chrome.runtime.onMessage.addListener(onMessageHandler);
