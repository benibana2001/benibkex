/**
 *
 * このファイルではContext Menusに表示する情報を管理する
 * - 蔵書検索を実行する対象の市区町村名の一覧を保持する
 */

import treeModel from 'tree-model';
import { PrefectureList } from 'benibana_bookdata';
// ContextMenusの各要素に割り振るID
export const CTX_ID_GET_COVER = 'GET_COVER';
export const CTX_ID_GET_LIBRARY_COLLECTION = 'GET_LIBRARY_COLLECTION';

/**
 * ContextMenuに追加する要素を木構造として作成
 *
 * IDは重要.親要素の指定や、クリックされた要素の特定に使用
 */
const tree = new treeModel();
// 図書館の蔵書を検索するContext
const ctxGetLibraryCollection = {
  id: CTX_ID_GET_LIBRARY_COLLECTION,
  name: 'Search Library Collection',
  children: [] // childrenには市区町村名が入る
};

/**
 * ContextMenusのchildrennを作成
 */
const contexts = [];
// 図書館の蔵書検索を実行する対象の都道府県を一覧表示
// PrefectureListは外部リポジトリ（benibana_bookdata）で作成している
// - https://github.com/benibana2001/bookdata.git
PrefectureList.forEach((pref) => {
  const [prefId, prefName] = pref;
  const radioItem = {
    id: prefId,
    name: prefName,
    parentId: CTX_ID_GET_LIBRARY_COLLECTION,
    type: 'radio'
  };
  ctxGetLibraryCollection.children.push(radioItem);
});

const ctxTreeGetLibraryCollection = tree.parse(ctxGetLibraryCollection);

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
};

ctxTreeGetLibraryCollection.walk(treeWalkFunc);

export { contexts };
