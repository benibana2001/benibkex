(async () => {
  // DOMを取得する
  const elemISBN = document.querySelector(
    '#rpi-attribute-book_details-isbn13 .rpi-attribute-value span'
  );

  /**
   * Message処理。
   * service_worker.jsにメッセージを送信
   *
   * isbn-13がDOMにない場合は, 明示的にnullを渡す
   */
  if (elemISBN && elemISBN.textContent) {
    const isbn13 = elemISBN.textContent.replace('-', '');
    const response = await chrome.runtime.sendMessage({ isbn13: isbn13 });
    console.log(response);
  } else {
    await chrome.runtime.sendMessage({ isbn13: null });
    console.log('no isbn-13');
  }

  /**
   * 受信処理
   */
  chrome.runtime.onMessage.addListener(
    ({ reserveurl, libraryStock }, sender, sendResponse) => {
      console.log(
        sender.tab
          ? 'from a content script:' + sender.tab.url
          : 'from the extension'
      );
      // if (request.greeting === 'hello') sendResponse({ farewell: 'goodbye' });

      /**
       * ダイアログ作成
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
