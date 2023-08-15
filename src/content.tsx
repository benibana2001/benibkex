import { PrefectureList } from 'benibana_bookdata';
import { dispatch } from './variable.js';
import { createRoot, createPortal } from 'react-dom';
import React, { useRef, useEffect } from 'react';

(async () => {
  /**
   * メッセージ送信処理。
   * - DOMからisbn-13の値を取得しservice_worker.jsに送信する
   * - isbn-13がDOMにない場合は, 明示的にnullを送信する
   */
  const isbn13 = getElemISBN();
  console.log('isbn13', isbn13);
  await chrome.runtime.sendMessage({
    isbn13
  });

  /**
   * メッセージ受信処理
   * - action: service_workerから指定された動作
   * - payload:
   */
  const domNode = document.createElement('div');
  document.body.append(domNode);

  chrome.runtime.onMessage.addListener(async ({ action, payload }) => {
    switch (action) {
      // ダイアログ表示
      case dispatch[1]: {
        // Render Dialog Component
        const root = createRoot(domNode);
        root.render(<DialogManager payload={payload} root={root} />);
        break;
      }
    }
  });
})();

/**
 * service_workerに送信するISBN
 */
function getElemISBN(): string {
  const elemISBN = document.querySelector(
    '#rpi-attribute-book_details-isbn13 .rpi-attribute-value span'
  );
  if (elemISBN && elemISBN.textContent) {
    return elemISBN.textContent.replace('-', '');
  }
  return '';
}

/**
 * DialogManager
 * - DialogコンポーネントをPortalとしてbodyにappendする
 * - コンポーネントをrootからunmountする機能をDialogのCloseメソッドして渡す
 * - これはDialogのCloseボタンから実行可能とする
 *
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
 *
 * - 外部APIから渡ってきたpayloadを表示するDialog
 * - libraryStock（蔵書情報）をもとにテーブルを描画する.
 * - 蔵書情報がない場合はその旨を表示
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
        <tr className={canRent ? 'is-selected' : ''}>
          <td>{libraryName}</td>
          <td>{borrowingStatus}</td>
        </tr>
      )
    );
  };

  // dialogElementを活性化する
  useEffect(() => {
    dialogRef.current.showModal();
  });

  // 直接関数をDOMに埋め込むとunmountが実行できない
  const close = () => {
    closeDialog();
  };

  return (
    // Dialog描画
    <dialog className={dialogClass} ref={dialogRef} onClick={close}>
      <div className="wrapper modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-card-head">
          <p className="modal-card-title">Library Stock</p>

          {/* 閉じるボタン */}
          <button
            className="delete"
            aria-label="close"
            onClick={close}
          ></button>
        </header>

        <section className="modal-card-body">
          <p className="title is-4 ">
            <span>{`${getPrefectureName()}`}</span>
            <span className="is-6">{`の蔵書検索結果`}</span>
          </p>

          {existStock && (
            <div className="statusBookStock">
              <table
                className="table 
table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
              >
                <thead>
                  <tr>
                    <th>図書館</th>
                    <th>蔵書</th>
                  </tr>
                </thead>

                {/* 蔵書が存在する場合のみテーブルを描画 */}
                <tbody>{existStock && libraryStock.map(stockTable)}</tbody>
              </table>
            </div>
          )}

          <div className="block mt-5">
            {/* 蔵書がある場合のみボタン表示 */}
            {existStock && (
              <a
                className="linkReservePage button is-link"
                href={reserveurl}
                target="_blank"
              >
                予約画面を表示
              </a>
            )}
          </div>
        </section>

        {/* TODO: 設定画面を開く */}
        {/* <footer className="modal-card-foot">
          <button className="button">設定</button>
        </footer> */}
      </div>
    </dialog>
  );
}
