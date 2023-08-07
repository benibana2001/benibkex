/**
 *
 * このファイルではContext Menusに表示する情報を管理する
 * - 蔵書検索を実行する対象の市区町村名の一覧を保持する
 */

import TreeModal from 'tree-model';
import { PrefectureList } from 'benibana_bookdata';
// ContextMenusの各要素に割り振るID
export const CTX_ID_GET_COVER = 'GET_COVER';
export const CTX_ID_GET_LIBRARY_COLLECTION = 'GET_LIBRARY_COLLECTION';
export const CTX_ID_GET_LIBRARY_COLLECTION_FROM_OPTIONS_DATA =
  'GET_LIBRARY_COLLECTION_FROM_OPTIONS_DATA';
export const CTX_ID_GET_LIBRARY_COLLECTION_FROM_RADIO =
  'GET_LIBRARY_COLLECTION_FROM_RADIO';

/**
 * ContextMenuに追加する要素を木構造として作成
 *
 * IDは重要.親要素の指定や、クリックされた要素の特定に使用
 */
const tree = new TreeModal();

type TreeModel = {
  id: string;
  name: string;
  parentId?: string;
  children: TreeModel[];
};

// 図書館の蔵書を検索するContext
const ctxGetLibraryCollection: TreeModel = {
  id: CTX_ID_GET_LIBRARY_COLLECTION,
  name: 'Search Library Collection',
  children: [] // childrenには市区町村名が入る
};
const ctxGetLibraryCollectionFromOptionsData: TreeModel = {
  id: CTX_ID_GET_LIBRARY_COLLECTION_FROM_OPTIONS_DATA,
  parentId: CTX_ID_GET_LIBRARY_COLLECTION,
  name: '設定した地域から蔵書を検索',
  children: [] // childrenには市区町村名が入る
};
const ctxGetLibraryCollectionFromRadio: TreeModel = {
  id: CTX_ID_GET_LIBRARY_COLLECTION_FROM_RADIO,
  parentId: CTX_ID_GET_LIBRARY_COLLECTION,
  name: '地域を選択して検索',
  children: [] // childrenには市区町村名が入る
};

type Context = {
  title: string;
  id: string;
  parentId?: string;
};
/**
 * ContextMenusのchildrennを作成
 */
const contexts: Context[] = [];
// 図書館の蔵書検索を実行する対象の都道府県を一覧表示
// PrefectureListは外部リポジトリ（benibana_bookdata）で作成している
// - https://github.com/benibana2001/bookdata.git
PrefectureList.forEach((pref) => {
  const [prefId, prefName] = pref;
  const radioItem = {
    id: prefId,
    name: prefName,
    parentId: CTX_ID_GET_LIBRARY_COLLECTION_FROM_RADIO,
    children: [],
    type: 'radio'
  };
  ctxGetLibraryCollectionFromRadio.children.push(radioItem);
});

ctxGetLibraryCollection?.children.push(
  ctxGetLibraryCollectionFromOptionsData,
  ctxGetLibraryCollectionFromRadio
);
console.log(ctxGetLibraryCollection);
const ctxTree = tree.parse(ctxGetLibraryCollection);

/**
 * treeModelをもとにContextMenusを作成
 * @param {NodeList} node
 */
const treeWalkFunc = (node) => {
  const ctx = {
    title: node.model.name,
    id: node.model.id
  };

  // 親要素を持つ場合は親のIDを指定して要素を追加
  if (node.model.parentId) {
    ctx['parentId'] = node.model.parentId;
  }
  contexts.push(ctx);
  return true;
};

ctxTree.walk(treeWalkFunc);

export { contexts };
