import Vue from 'vue'
import Element from 'element-ui'
import Cookies from 'js-cookie'
import './style/index.css'
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue'
Vue.use(Element, {
  size: Cookies.get('size') || 'mini' // set element-ui default size
  // locale: enLang // 如果使用中文，无需设置，请删除
})

Vue.config.productionTip = false
new Vue({
  el: '#vue-app',
  render: h => h(App)
})
