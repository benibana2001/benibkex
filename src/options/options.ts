import { PrefectureList } from 'benibana_bookdata';

// Saves options to chrome.storage
const saveOptions = () => {
  const elem = document.getElementById('pref') as HTMLSelectElement;
  const { value } = elem;

  // option保存をする
  chrome.storage.sync.set({ value }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById('status') as HTMLDivElement;
    if (status) {
      status.textContent = 'Options saved.';
    }
    setTimeout(() => {
      if (status) {
        status.textContent = '';
      }
    }, 750);
  });
};

const initPage = () => {
  /**
   * DOM生成
   */
  const parent = document.getElementById('pref') as HTMLSelectElement;
  PrefectureList.forEach(([id, name]) => {
    const child = document.createElement('option');
    child.value = id;
    child.text = name;
    parent?.append(child);
  });

  /**
   * storageを読み込み
   */
  chrome.storage.sync.get('value').then(({ value }) => {
    if (parent && value) {
      PrefectureList.forEach((item, index) => {
        if (item[0] === value) {
          parent.getElementsByTagName('option')[index + 1].selected = true;
          // TODO: breakするように なんかfor文は動作しない
        }
      });
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initPage();
});
document.getElementById('save')?.addEventListener('click', saveOptions);
