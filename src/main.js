import Vue from 'vue'
import App from './App.vue'
import router from './router'
import http from "./views/http.js";
// var VConsole = require('vconsole');
// var vconsole = new VConsole();

Vue.config.productionTip = true
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
