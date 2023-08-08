import { PrefectureList } from 'benibana_bookdata';
console.log('hello');
// Saves options to chrome.storage
const saveOptions = () => {
  // const color = document.getElementById('color')?.value;
  // const likesColor = document.getElementById('like').checked;

  // chrome.storage.sync.set(
  //   { favoriteColor: color, likesColor: likesColor },
  //   () => {
  //     // Update status to let user know options were saved.
  //     const status = document.getElementById('status');
  //     status.textContent = 'Options saved.';
  //     setTimeout(() => {
  //       status.textContent = '';
  //     }, 750);
  //   }
  // );
  const elem = document.querySelector('#pref selected') as HTMLSelectElement;
  console.log('elem', elem);
  console.log('elem.value', elem?.value);
  const { value, name } = elem;

  // option保存をする
  chrome.storage.sync.set({ value, name }, () => {
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

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  // chrome.storage.sync.get(
  //   { favoriteColor: 'red', likesColor: true },
  //   (items) => {
  //     document.getElementById('color').value = items.favoriteColor;
  //     document.getElementById('like').checked = items.likesColor;
  //   }
  // );
  const value = chrome.storage.sync.get('value');
  const name = chrome.storage.sync.get('name');
  console.log('value', value);
  console.log('name', name);

  const parent = document.getElementById('pref');
  PrefectureList.forEach(([id, name]) => {
    const child = document.createElement('option');
    child.value = id;
    child.text = name;
    console.log('id', id);
    console.log('name', name);
    parent?.append(child);
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save')?.addEventListener('click', saveOptions);
