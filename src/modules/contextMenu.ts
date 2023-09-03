import { contexts } from '../contextTree.js';
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
