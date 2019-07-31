<template>
<nav>
    <!--  Main Banner -->
  <v-toolbar dark>
    <v-toolbar-side-icon @click="drawer=!drawer"></v-toolbar-side-icon>
    <v-toolbar-title>MyPersonalizedRoute</v-toolbar-title>
    <v-spacer></v-spacer>

    <!-- help menu that tells users what the app is and how to use it -->
    <div class="text-xs-center">
    <v-dialog
      v-model="about"
      width="500"
    >
        <template v-slot:activator="{ on }">
          <v-btn flat fab class="hidden-sm-and-down" v-on="on">
            <v-icon large>help</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-title
            class="headline grey lighten-2"
            primary-title
          >
            Privacy Policy
          </v-card-title>

          <v-card-text>
           HELLO
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              flat
              @click="about = false"
            >
              I accept
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <!--  log in fields-->
    <div class="text-xs-center">
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
       <v-btn flat fab class="hidden-sm-and-down">
        <v-icon large v-on="on">account_circle</v-icon>
      </v-btn>
      </template>
      <v-list>
        <v-list-tile>beep</v-list-tile>
        <v-list-tile>boop</v-list-tile>
        <v-list-tile>badaboop</v-list-tile>
      </v-list>
    </v-menu>
  </div>
    
  </v-toolbar>

    <!--  side menu drawer -->
  <v-navigation-drawer app flat dark v-model="drawer" width="400" > 
      <v-btn fab flat small @click="drawer=false" > 
          <v-icon small>close</v-icon>
      </v-btn>
      <v-img :src="require('../assets/MPRLogo.png')"></v-img>
      <!-- dropdown -->
      <div class="text-xs-center" >
      <v-text-field placeholder="Find a Location!" prepend-icon="room"  
      clearable v-model="search" @click:prepend="findLoc(search,0)"
       @keyup.enter.stop="findLoc(search,0)" class="ma-3"></v-text-field>
      <v-expansion-panel light>
        <v-expansion-panel-content >
          <template v-slot:header>
            <h1>Find My Route!</h1>
          </template>
          <v-card class="grey lighten-3">
            <v-text-field label="Origin" prepend-icon="search" clearable 
            @click:prepend.stop="findLoc(origin,1)" v-model="origin" 
            @keyup.enter.stop="findLoc(origin,1)" class="mx-3"></v-text-field>
            <v-text-field label="Destination" prepend-icon="search" clearable 
            @click:prepend.stop="findLoc(dest,2)" v-model="dest" 
            @keyup.enter.stop="findLoc(dest,2)" class="mx-3"></v-text-field>
            <v-menu
              ref="menu"
              v-model="timeMenu"
              :close-on-content-click="false"
              :return-value.sync="time"
              lazy
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                v-model="time"
                label="Time"
                prepend-icon="access_time"
                readonly
                v-on="on"
                class="mx-3"
                ></v-text-field>
              </template>
              <v-time-picker
                v-if="timeMenu"
                v-model="time"
                full-width
                @click:minute="$refs.menu.save(time)"
              ></v-time-picker>
            </v-menu>
            <v-radio-group class="mx-3" v-model="option">
              <v-radio label="Shortest Distance" value="0" key="1"></v-radio>
              <v-radio label="Shortest Time" value=1 key="2"></v-radio>
              <v-radio label="Most Popular" value=2 key="3"></v-radio>
              <v-radio label="Personalized Route" value=3 key="4"></v-radio>
            </v-radio-group>
            <div class = "text-xs-center" @click="findRoute">
            <v-btn large @click="drawer=!drawer"> 
              <v-icon>time_to_leave</v-icon>
              <span>Search</span>
            </v-btn>
            </div>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      </div>

  </v-navigation-drawer>

</nav>
</template>

<script> 
import {eventBus} from '../main.js'

 export default {
   name: "toolbar",
     data() {
         return {
            drawer:false,
            about: false,
            time: null,
            timeMenu: false,
            origin_latlng: [],
            origin: null,
            dest_latlng: [],
            dest: null,
            search: null,
            option: "0" 
        } 
     },
  mounted() {
    this.grabTime();
    //event handler to set the coordinates of points 
    eventBus.$on('set-field', mark => {
        let _this = this
        //for origin
        if (mark.choice == 0) {
            this.origin_latlng = [mark.location.lat, mark.location.lng]
            //console.log("This is the Origin: " + this.origin_latlng)
            //reverse geocoding to get adress name from lat long
            this.$http.get('https://nominatim.openstreetmap.org/reverse?', {
                params: {
                    lat: _this.origin_latlng[0],
                    lon: _this.origin_latlng[1],
                    zoom: 18,
                    //Option 1 seperates address into parts i.e. footway, city, country, etc
                    addressdetails: 1 
                }
            })
            .then(function(response) {
                //console.log(response.request.responseXML.all[1].innerHTML)
                _this.origin = response.request.responseXML.all[1].innerHTML;

            })
            .catch(function (error) {
                console.log(error);
            });
            // for destination
        } else if (mark.choice == 1) {
            this.dest_latlng = [mark.location.lat, mark.location.lng]
            //console.log("This is the Origin: " + this.origin_latlng)
            //reverse geocoding to get address name from lat long
            this.$http.get('https://nominatim.openstreetmap.org/reverse?', {
                params: {
                    lat: _this.dest_latlng[0],
                    lon: _this.dest_latlng[1],
                    zoom: 18,
                    //Option 1 seperates address into parts i.e. footway, city, country, etc
                    addressdetails: 1 
                }
            })
            .then(function(response) {
                //console.log(response.request.responseXML.all[1].innerHTML)
                _this.dest = response.request.responseXML.all[1].innerHTML;

            })
            .catch(function (error) {
                console.log(error);
            });
        }
      });
    //fills address with full name after a search query
    eventBus.$on('fill-fields', result => {
        if (result.choice == 0) { //from search bar
            this.search = result.name
        } else if (result.choice == 1) { //from origin field
            this.origin = result.name 
            this.origin_latlng = result.coord
        } else if (result.choice == 2) { //from dest field
            this.dest = result.name
            this.dest_latlng = result.coord
        } else if (result.choice == 3) { //from user location
            let _this = this;
            this.origin_latlng = [result.location.lat, result.location.lng];
            this.$http.get('https://nominatim.openstreetmap.org/reverse?', {
                params: {
                    lat: result.location.lat,
                    lon: result.location.lng,
                    zoom: 18,
                    //Option 1 seperates address into parts i.e. footway, city, country, etc
                    addressdetails: 1 
                }
            })
            .then(function(response) {
                //console.log(response.request.responseXML.all[1].innerHTML)
                _this.origin = response.request.responseXML.all[1].innerHTML;
            })
            .catch(function (error) {
                console.log(error);
            });
        } else if (result.choice == 4) { // dest validation
            this.dest_latlng = result.coord
            this.dest = result.name
        } else if (result.choice == 5) {
            this.origin_latlng = result.coord
            this.origin = result.name
        }
    });
  },
  methods: {
    grabTime() {
      var today = new Date();
      var hour = today.getHours();
      var minute = today.getMinutes();
      var time;
      //if hour and/ or minute < 10 - add a zero
      if (hour < 10) {
          time = "0" + hour;
          if (minute < 10) {
              time = time + ":0";
          } else {
              time = time + ":";
          }
          time = time + minute;
      } else if (minute < 10) {
          time = hour + ":0" + minute;
      } else {
          time = hour + ":" + minute;
      }
      this.time = time.toString();
    },
    findLoc(searchQuery, option) {
      if(searchQuery) {
          eventBus.$emit('search-submit', {'query': searchQuery, 'choice': option})
      }
    },
    //when click GO! button to find route
    findRoute() {
        var filled = true;
        if (this.origin == null || this.dest == null || this.time == null) {
            filled = false;
        }
        if (!filled) {
            alert("Cannot find route! One or more fields are missing")
        } else if (filled) { 
            //validates the coordinates of the origin and destination before routing 
            if (this.dest_latlng.length == 0) {
                eventBus.$emit('search-submit', {'query': this.dest, 'choice': 3});
            }
            if (this.origin_latlng.length == 0) {
                eventBus.$emit('search-submit', {'query': this.origin, 'choice': 4});
            }
            eventBus.$emit('find-route', {'orig': this.origin_latlng, 'dest': this.dest_latlng, 'option': this.option, 'time': this.time});   
        }
    },
  }
}

</script>