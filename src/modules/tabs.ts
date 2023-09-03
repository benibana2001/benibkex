import { strictTab, TabID, ISBN, Tab, TabsCache, TabData } from '../types';
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