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
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(
      sender.tab
        ? 'from a content script:' + sender.tab.url
        : 'from the extension'
    );
    console.log(request);
    // if (request.greeting === 'hello') sendResponse({ farewell: 'goodbye' });
  });
})();
