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
    ({ reserveurl, libraryStock }, sender, sendResponse) => {
      // memo: sender.tab.urlでタブの情報を取得可能

      /**
       * ダイアログ作成
       *
       * TODO: CSS調整
       * TODO: 予約画面が存在しない場合の処理
       */
      const dialog = document.createElement('dialog');
      document.body.append(dialog);
      const elems = {
        wrapper: document.createElement('div'),
        linkReservePage: document.createElement('a'),
        statusBookStock: document.createElement('div'),
        close: document.createElement('button'),
        init: () => {
          console.log('init');
          elems.close.innerText = '閉じる';
          elems.close.style = 'text-decoration: underline; color: gray;';
        }
      };

      elems.init();
      elems.linkReservePage.href = reserveurl;
      elems.linkReservePage.target = '_blank';
      elems.linkReservePage.innerText = '予約画面を表示';

      if (libraryStock.length > 0) {
        libraryStock.forEach(({ libraryID, libraryName, borrowingStatus }) => {
          const item = document.createElement('li');
          const canRent = borrowingStatus.includes('可') ? true : false;
          item.innerText = `${libraryID}.${libraryName}: 貸出状況：${borrowingStatus}`;
          item.style = canRent
            ? 'font-weight:bold;color:#2b821f'
            : 'color:#373737';
          elems.statusBookStock.append(item);
        });
      }

      elems.wrapper.append(
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
