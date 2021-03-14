const runSearch = () => {
  chrome.tabs.query({
    currentWindow: true,
    active: true,
  }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, null);
  });
};


const addListeners = () => {
  document.getElementById("Calculate").addEventListener('click', () => {
    runSearch();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  addListeners();
});