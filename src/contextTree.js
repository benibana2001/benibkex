/**
 * Init ContextMenu List
 */

import treeModel from 'tree-model';
import { PrefectureList } from 'benibana_bookdata';
export const CTX_ID_GET_COVER = 'GET_COVER';
export const CTX_ID_GET_LIBRARY_COLLECTION = 'GET_LIBRARY_COLLECTION';

/**
 * ContextMenuに追加する要素を木構造として作成
 *
 * IDは重要.親要素の指定や、クリックされた要素の特定に使用
 */
const tree = new treeModel();
// 書影を取得するContext
const ctxGetCover = {
  id: CTX_ID_GET_COVER,
  name: 'Get Book Cover',
  children: [
    {
      id: `${CTX_ID_GET_COVER}_A`,
      name: 'Copy to Clipboard',
      parentId: CTX_ID_GET_COVER
    },
    {
      id: `${CTX_ID_GET_COVER}_B`,
      name: 'Open URL',
      parentId: CTX_ID_GET_COVER
    }
  ]
};
// 図書館の蔵書を検索するContext
const ctxGetLibraryCollection = {
  id: CTX_ID_GET_LIBRARY_COLLECTION,
  name: 'Search Library Collection',
  children: []
};

/**
 * ContextMenuの一覧を作成してExport
 */
// 図書館の蔵書検索を実行する対象の都道府県を一覧表示
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
const ctxTreeGetCover = tree.parse(ctxGetCover);
const ctxTreeGetLibraryCollection = tree.parse(ctxGetLibraryCollection);

const contexts = [];
const treeWalkFunc = (node) => {
  // メニューに追加する要素を作成
  const ctx = {
    title: node.model.name,
    id: node.model.id
  };

  // 親を保つ場合は親のIDを指定して要素を追加
  if (node.model.parentId) {
    ctx['parentId'] = node.model.parentId;
  }
  contexts.push(ctx);
};

// TODO: 書影取得機能
// ctxTreeGetCover.walk(treeWalkFunc);
ctxTreeGetLibraryCollection.walk(treeWalkFunc);

export { contexts };
