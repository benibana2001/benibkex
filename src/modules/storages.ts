import { strictTab, TabID, ISBN, Tab, TabsCache, TabData } from '../types';

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
