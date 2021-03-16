export default () => new Promise((resolve, reject) => {
  chrome.tabs.query({
    currentWindow: true,
    active: true,
  }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, null, (resp) => {
      resolve(resp);
      return resp;
    });
  });
});
