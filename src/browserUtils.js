export const runSearch = () => new Promise((resolve, reject) => {
  chrome.tabs.query({
    currentWindow: true,
    active: true,
  }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'runSearch' }, (resp) => {
      resolve(resp);
      return resp;
    });
  });
});

export const openPage = url => {
  chrome.tabs.query({
    currentWindow: true,
    active: true,
  }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'openUrl', url });
    window.open(url, '_blank', 'noopener noreferrer');
  });
};
