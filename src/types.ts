/**
 * idとurlプロパティをTabに強制する
 * もとはoptional
 */
export type strictTab = Tab & { id: number; url: string };
export type TabID = number;
export type ISBN = string | '' | undefined;
export type Tab = chrome.tabs.Tab;

/**
 * tabIDとISBNのマップ
 */
export type TabsCache = Map<TabID, ISBN>;

export type TabData = {
  isbn: ISBN;
};
