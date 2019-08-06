<template>
  <v-app id="app">
   
    <toolbar />
    <!-- <searchbar/> -->
    <v-content>
      <leaflet/>
    </v-content>

  </v-app>
</template>

<script>
import banner from './components/banner.vue'
import leaflet from './components/leaflet.vue'
import searchbar from './components/searchbar.vue'
import toolbar from './components/toolbar.vue'

export default {
  name: 'app',
  components: {
    banner,
    searchbar,
    leaflet,
    toolbar,
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
