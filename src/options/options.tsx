import { createRoot } from 'react-dom';
import React from 'react'; // Import React directly, no need for 'createElement'
import { PrefectureList } from 'benibana_bookdata';
import { useEffect, useRef, useState } from 'react';

function MainDOM() {
  const [saved, setSaved] = useState(false);
  const selectRef = useRef(null);

  const saveHandler = () => {
    chrome.storage.sync.set({ value: selectRef.current.value }).then(() => {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    });
  };

  useEffect(() => {
    // storageを読み込んで画面に反映する
    chrome.storage.sync.get('value').then(({ value }) => {
      if (value) {
        PrefectureList.forEach((item, index) => {
          if (item[0] === value) {
            selectRef.current[index + 1].selected = true;
            // TODO: breakするように なんかfor文は動作しない
          }
        });
      }
    });
  }, []);

  return (
    <>
      <div className="container is-max-desktop">
        <section class="content section">
          <h1 className="title">Search Library Collection</h1>
          <div className="card">
            <div className="card-header">
              <p className="card-header-title is-3">設定(蔵書検索)</p>
            </div>

            <div className="card-content">
              <p className="subtitle">デフォルトで検索する地域</p>
              <div className="select">
                <select ref={selectRef} id="pref">
                  <option value="" selected>
                    地域を選択
                  </option>
                  {PrefectureList.map(([id, name]) => {
                    return <option value={id}>{name}</option>;
                  })}
                </select>
              </div>
            </div>

            <footer className="card-footer">
              <a id="save" className="card-footer-item" onClick={saveHandler}>
                Save
              </a>
              {/* <a id="delete" className="card-footer-item">
                Delete
              </a> */}
            </footer>
          </div>
        </section>

        {/* 保存通知 */}
        {saved && (
          <article class="message is-success">
            <div class="message-body">
              <div class="content has-text-centered">
                <p>
                  new setting is <strong>saved !</strong>
                </p>
              </div>
            </div>
          </article>
        )}
      </div>

      <footer class="footer">
        <div class="content has-text-centered">
          <p>
            <strong>benibkex</strong> by{' '}
            <a href="https://github.com/benibana2001">benibana2001</a>
          </p>
        </div>
      </footer>
    </>
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const domNode = document.getElementById('app');
  const root = createRoot(domNode);
  root.render(<MainDOM />);
});
