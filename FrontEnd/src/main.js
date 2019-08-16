import Vue from 'vue'
import Vuetify from 'vuetify'
import axios from 'axios'
import App from './App.vue'
import '../node_modules/vuetify/dist/vuetify.min.css'



Vue.config.productionTip = false
Vue.use(axios)
Vue.use(Vuetify)

//creates a constant variable eventBus
export const eventBus = new Vue()
//allows axios to be used globally
Vue.prototype.$http = axios

new Vue({
  render: h => h(App),
}).$mount('#app')
