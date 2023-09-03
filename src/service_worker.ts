import { isAmazonItemPage } from './util.js';
import { getActiveTab, initializeTabWithISBN } from './modules/tabs.js';
import { getAllStorageData, clearTabData } from './modules/storages.js';
import { TabsCache } from './types.js';
import {
  clickContextMenuHandler,
  createContextMenuFromTabsCache
} from './modules/contextMenu.js';
import { activatePopup } from './modules/popups.js';

const tabs: TabsCache = new Map();

/**
 * isbn13を受け取り格納するハンドラー
 * - isbnが存在しないときはContextMenuを作成しない
 */
chrome.runtime.onMessage.addListener(async (request, { tab }) => {
  // タブがない場合はreturn
  if (!tab || !tab.id) return;

  // Tabを格納
  initializeTabWithISBN(tab, tabs, request);

  // ContextMenu作成
  const activeTab = await getActiveTab();
  if (!activeTab) return;
  createContextMenuFromTabsCache(activeTab, tabs);

  // TODO: popupの更新
  await activatePopup(activeTab, tabs);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  clickContextMenuHandler(info, tab, tabs);
});

/**
 * Tabを初期化
 * - ContextMenu作成
 * TODO: Amazon以外のページはPopupの中身を変更
 */
// ACTIVATEDのときはISBNをstateから取得してメニュー作成
chrome.tabs.onActivated.addListener(async () => {
  const tab = await getActiveTab();

  // ページにtab情報が存在しがない場合は終了
  if (!tab) return;

  await createContextMenuFromTabsCache(tab, tabs);
  await activatePopup(tab, tabs);
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
    if (isAmazonItemPage(tab.url)) chrome.tabs.reload(tab.id);
  });

  await clearTabData();
  console.log(await getAllStorageData());
});

// タブ削除イベント
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabs.get(tabId)) tabs.delete(tabId);
  console.log('TAB REMOVED');
  console.log('tabId', tabId);
  console.log('tabs', tabs);
});
