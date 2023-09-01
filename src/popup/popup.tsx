import { createRoot } from 'react-dom';
import React from 'react'; // Import React directly, no need for 'createElement'
import { useEffect, useRef, useState } from 'react';
import { isAmazonPage } from '../util';

// TODO:popup.jsの起動タイミングが不明瞭
console.log('popup.js');
function MainDOM() {
  // useEffect(() => {}, []);

  const goToOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  return (
    <>
      <div>
        {/* TODO: 現在のページがAmazonのページではないことを通知 */}
        {/* {!isAmazonPage(location.host) && (
          <div>この拡張機能はamazon.co.jpのみで有効です。</div>
        )} */}
        {/* TODO: 現在のページにISBNがあることを判定 */}
        <button onClick={goToOptionsPage}>Go to options</button>
      </div>
    </>
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const domNode = document.getElementById('app');
  const root = createRoot(domNode);
  root.render(<MainDOM />);
});
