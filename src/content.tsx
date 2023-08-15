import { PrefectureList } from 'benibana_bookdata';
import { dispatch } from './variable.js';
import { createRoot, createPortal } from 'react-dom';
import React, { useRef } from 'react'; // Import React directly, no need for 'createElement'

(async () => {
  /**
   * service_workerに送信するISBN
   */
  let isbn13 = '';
  const elemISBN = document.querySelector(
    '#rpi-attribute-book_details-isbn13 .rpi-attribute-value span'
  );

  /**
   * メッセージ送信処理。
   * - DOMからisbn-13の値を取得しservice_worker.jsに送信する
   * - isbn-13がDOMにない場合は, 明示的にnullを送信する
   */
  if (elemISBN && elemISBN.textContent) {
    isbn13 = elemISBN.textContent.replace('-', '');
    // メッセージ送信
    await chrome.runtime.sendMessage({
      isbn13
    });
  } else {
    await chrome.runtime.sendMessage({ isbn13: null });
    console.log('isbn-13の情報がこのページには存在しません');
  }

  /**
   * メッセージ受信処理
   * - action: service_workerから指定された動作
   * - payload:
   */
  chrome.runtime.onMessage.addListener(async ({ action, payload }) => {
    switch (action) {
      // ダイアログ表示
      case dispatch[1]: {
        /**
         * Render Dialog Component
         */
        const domNode = document.createElement('div');
        const root = createRoot(domNode);
        document.body.append(domNode);
        root.render(<DialogManager payload={payload} root={root} />);
        break;
      }
      default:
    }
  });
})();

/**
 * DialogManager
 * @param payload
 * @returns
 */
function DialogManager({ payload, root }) {
  return createPortal(
    <Dialog
      {...payload}
      closeDialog={() => {
        root.unmount();
      }}
    />,
    document.body
  );
}

/**
 * Dialog Component
 * @param param0
 * @returns
 */
function Dialog({ systemid, reserveurl, libraryStock, closeDialog }) {
  const classRoot = 'benibkex';
  const dialogClass = `${classRoot} modal is-active`;
  const dialogRef = useRef(null);
  const existStock = libraryStock.length > 0;

  /**
   * systemidをもとに都道府県の文字列を取得する
   * @returns
   */
  const getPrefectureName = () => {
    let _prefectureName = '';
    PrefectureList.forEach(([id, name]) => {
      if (id === systemid) {
        _prefectureName = name;
      }
    });
    return _prefectureName;
  };

  /**
   * Dialog内のテーブルを描画する
   */
  const stockTable = ({ libraryName, borrowingStatus }) => {
    const canRent = borrowingStatus.includes('可') ? true : false;
    return (
      existStock && (
        <tr>
          <td>{libraryName}</td>
          <td>{borrowingStatus}</td>
        </tr>
      )
    );
  };

  return (
    // Dialog描画
    <dialog className={dialogClass} ref={dialogRef}>
      <div className="wrapper modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">benibkex</p>

          {/* 閉じるボタン */}
          <button
            className="delete"
            aria-label="close"
            onClick={() => {
              console.log('closeDialog()');
              closeDialog();
            }}
          ></button>
        </header>

        <section className="modal-card-body">
          <p className="title is-4 ">{`${getPrefectureName()} の蔵書検索結果`}</p>

          {existStock && (
            <div className="statusBookStock">
              <table className="table is-striped">
                <thead>
                  <tr>
                    <th></th>
                  </tr>
                </thead>

                {/* 蔵書が存在する場合のみテーブルを描画 */}
                <tbody>{existStock && libraryStock.map(stockTable)}</tbody>
              </table>
            </div>
          )}

          <div className="block">
            {/* 蔵書がある場合のみボタン表示 */}
            {existStock && (
              <a className="linkReservePage" href={reserveurl} target="_blank">
                予約画面を表示
              </a>
            )}
          </div>
        </section>

        <footer className="modal-card-foot">
          {/* TODO: 設定画面を開く */}
          <div className="button">設定</div>
        </footer>
      </div>
    </dialog>
  );
}
