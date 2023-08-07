import { PrefectureList } from 'benibana_bookdata';
import { dispatch } from './variable.js';
(async () => {
  /**
   * service_workerに送信するISBN
   */
  let isbn13 = '';

  /**
   * メッセージ受信処理
   * - action: service_workerから指定された動作
   * - payload:
   */
  chrome.runtime.onMessage.addListener(
    async ({ action, payload }, sender, sendResponse) => {
      // memo: sender.tab.urlでタブの情報を取得可能
      switch (action) {
        /**
         * メッセージ送信処理。
         * - DOMからisbn-13の値を取得しservice_worker.jsに送信する
         * - isbn-13がDOMにない場合は, 明示的にnullを送信する
         */
        case dispatch[0]: {
          const elemISBN = document.querySelector(
            '#rpi-attribute-book_details-isbn13 .rpi-attribute-value span'
          );

          if (elemISBN && elemISBN.textContent) {
            isbn13 = elemISBN.textContent.replace('-', '');
            console.log('message send')
            await chrome.runtime.sendMessage({
              isbn13
            });
          } else {
            await chrome.runtime.sendMessage({ isbn13: null });
            console.log('isbn-13の情報がこのページには存在しません');
          }
          return;
        }
        /**
         * ダイアログ表示処理
         * - service_workerで外部APIの情報取得が完了した際にメッセージを受信
         * - 受信した情報をもとに図書館の貸出状況を表示
         *   - 予約画面へのリンク
         *   - 図書館別の蔵書情報
         * - 蔵書が存在しない場合は
         */
        // TODO:蔵書が存在しない場合
        case dispatch[1]: {
          createDialog(payload);
          break;
        }
        default:
      }
    }
  );
})();

const createDialog = ({ systemid, reserveurl, libraryStock }) => {
  /**
   * ダイアログ作成
   * TODO: 予約画面が存在しない場合の処理
   */
  const dialog = document.createElement('dialog');
  dialog.setAttribute('style', 'border: gray 2px solid; border-radius: 6px;');
  document.body.append(dialog);
  const elems = {
    wrapper: document.createElement('div'),
    title: document.createElement('p'),
    linkReservePage: document.createElement('a'),
    statusBookStock: document.createElement('div'),
    close: document.createElement('button'),
    init: () => {
      elems.close.innerText = '閉じる';
      elems.close.setAttribute('style', 'color: gray;');
    }
  };

  elems.init();
  elems.title.innerText = (() => {
    let prefectureName = '';

    PrefectureList.forEach(([id, name]) => {
      if (id === systemid) {
        prefectureName = name;
      }
    });

    return prefectureName ? `${prefectureName} の蔵書` : '';
  })();
  elems.title.setAttribute('style', 'font-size:18px;text-align:center;');
  elems.linkReservePage.href = reserveurl;
  elems.linkReservePage.target = '_blank';
  elems.linkReservePage.innerText = '予約画面を表示';

  if (libraryStock.length > 0) {
    libraryStock.forEach(({ libraryName, borrowingStatus }) => {
      const item = document.createElement('li');
      const canRent = borrowingStatus.includes('可') ? true : false;
      const span1 = document.createElement('span');
      const span2 = document.createElement('span');
      span1.innerText = libraryName;
      span2.innerText = `...${borrowingStatus}`;
      if (canRent) {
        item.setAttribute(
          'style',
          'display:flex;justify-content:space-around;font-weight:bold;color:#2b821f'
        );
      } else {
        item.setAttribute(
          'style',
          'display:flex;justify-content:space-around;color:#373737'
        );
      }
      item.append(span1, span2);
      elems.statusBookStock.append(item);
    });
    libraryStock.style = 'padding:6px 0;';
  }

  elems.wrapper.append(
    elems.title,
    elems.statusBookStock,
    elems.linkReservePage,
    elems.close
  );
  dialog.append(elems.wrapper);

  // dialogの背面をクリックした場合のみdialogを閉じている
  // dialog内部の要素クリック時はイベントの伝播を抑制している
  elems.wrapper.addEventListener('click', (e) => e.stopPropagation());
  elems.close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', () => dialog.close());

  dialog.showModal();
};
