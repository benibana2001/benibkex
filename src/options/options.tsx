import { createRoot } from 'react-dom';
import React from 'react'; // Import React directly, no need for 'createElement'
import { PrefectureList } from 'benibana_bookdata';
import { useEffect, useRef } from 'react';

// TODO: Save 時にToast
// // Saves options to chrome.storage
// const saveOptions = () => {
//   const elem = document.getElementById('pref') as HTMLSelectElement;
//   const { value } = elem;

//   // option保存をする
//   chrome.storage.sync.set({ value }, () => {
//     // Update status to let user know options were saved.
//     const status = document.getElementById('status') as HTMLDivElement;
//     if (status) {
//       status.textContent = 'Options saved.';
//     }
//     setTimeout(() => {
//       if (status) {
//         status.textContent = '';
//       }
//     }, 750);
//   });
// };

function MainDOM() {
  const selectRef = useRef(null);

  function save() {
    chrome.storage.sync.set({ value: selectRef.current.value }).then(() => {
      console.log('Value is set');
    });
  }

  useEffect(() => {
    // storageを読み込んで画面に反映する
    chrome.storage.sync.get('value').then(({ value }) => {
      if (value) {
        PrefectureList.forEach((item, index) => {
          if (item[0] === value) {
            selectRef.current[index + 1].selected = true;
            // parent.getElementsByTagName('option')[index + 1].selected = true;
            // TODO: breakするように なんかfor文は動作しない
          }
        });
      }
    });
  }, []);
  return (
    <>
      <section class="content section">
        <div className="container is-max-desktop">
          <h1 className="title">benibkex</h1>
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
              <a id="save" className="card-footer-item" onClick={save}>
                Save
              </a>
              {/* <a id="delete" className="card-footer-item">
                Delete
              </a> */}
            </footer>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="content has-text-centered">
          <p>
            <strong>benibkex</strong> by{' '}
            <a href="https://wasabi-hu.com">benibana2001</a>
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
