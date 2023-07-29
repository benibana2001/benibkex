import { PrefectureList } from 'benibana_bookdata';
(async () => {
  // DOMを取得する
  const elemISBN = document.querySelector(
    '#rpi-attribute-book_details-isbn13 .rpi-attribute-value span'
  );

  /**
   *
   * メッセージ送信処理。
   *
   * DOMからisbn-13の値を取得しservice_worker.jsに送信する
   * isbn-13がDOMにない場合は, 明示的にnullを送信する
   *
   */
  if (elemISBN && elemISBN.textContent) {
    const isbn13 = elemISBN.textContent.replace('-', '');
    const response = await chrome.runtime.sendMessage({ isbn13: isbn13 });
    console.log(response);
  } else {
    await chrome.runtime.sendMessage({ isbn13: null });
    console.log('isbn-13の情報がこのページには存在しません');
  }

  /**
   * メッセージ受信処理
   *
   * service_workerで外部APIの情報取得が完了した際にメッセージを受信
   * ここでは受信した情報をもとにHTMLDialogElementを作成して表示する
   * dialogには下記の受信した情報を表示する
   *  - 予約画面へのリンク
   *  - 図書館別の蔵書情報
   */
  chrome.runtime.onMessage.addListener(
    ({ systemid, reserveurl, libraryStock }, sender, sendResponse) => {
      // memo: sender.tab.urlでタブの情報を取得可能

      /**
       * ダイアログ作成
       *
       * TODO: 予約画面が存在しない場合の処理
       */
      const dialog = document.createElement('dialog');
      dialog.style = 'border: gray 2px solid; border-radius: 6px;';
      document.body.append(dialog);
      const elems = {
        wrapper: document.createElement('div'),
        title: document.createElement('p'),
        linkReservePage: document.createElement('a'),
        statusBookStock: document.createElement('div'),
        close: document.createElement('button'),
        init: () => {
          console.log('init');
          elems.close.innerText = '閉じる';
          elems.close.style = 'color: gray;';
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

        console.log(prefectureName);
        return prefectureName ? `${prefectureName} の蔵書` : '';
      })();
      elems.title.style = 'font-size:18px;text-align:center;';
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
          item.style = canRent
            ? 'display:flex;justify-content:space-around;font-weight:bold;color:#2b821f'
            : 'display:flex;justify-content:space-around;color:#373737';
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

      /*
       * dialogの背面をクリックした場合のみdialogを閉じる
       * - dialog内部の要素クリック時はイベントの伝播を抑制する
       */
      elems.wrapper.addEventListener('click', (e) => e.stopPropagation());
      elems.close.addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', () => dialog.close());

      dialog.showModal();
    }
  );
})();
