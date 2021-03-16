import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';

// const runSearch = () => {
//   chrome.tabs.query({
//     currentWindow: true,
//     active: true,
//   }, (tabs) => {
//     chrome.tabs.sendMessage(tabs[0].id, null);
//   });
// };

// const UNDERSTAND = 'understand';
// let userUnderstands = false;
// const addListeners = () => {
//   const actionButton = document.getElementById('Calculate');
//   const localData = localStorage.getItem(UNDERSTAND);
//   if (localData) {
//     const { userUnderstands: _userUnderstands, expires } = JSON.parse(localData);
//     if (_userUnderstands) {
//       const now = new Date();
//       if (new Date(expires) > now) {
//         userUnderstands = _userUnderstands;
//       }
//     }
//   }
//   actionButton.disabled = !userUnderstands;

//   const understandInput = document.getElementById(UNDERSTAND);
//   understandInput.checked = userUnderstands;

//   understandInput.addEventListener('change', (event) => {
//     userUnderstands = event.target.checked;
//     actionButton.disabled = !userUnderstands;
//     if (userUnderstands) {
//       const expires = new Date();
//       expires.setHours(expires.getHours() + 1);
//       localStorage.setItem(UNDERSTAND, JSON.stringify({ userUnderstands, expires }));
//     } else {
//       localStorage.removeItem(UNDERSTAND);
//     }
//   });
//   actionButton.addEventListener('click', () => {
//     if (userUnderstands) {
//       runSearch();
//     }
//   });
// };

// document.addEventListener('DOMContentLoaded', () => {
//   addListeners();
// });

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
