import Vue from 'vue';

export default () => {
  chrome.tabs.query({
    currentWindow: true,
    active: true,
  }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, null, displayData);
  });
};
