<template>
    <div id = "mysearch" class="search"> 
        <a class="closebtn" @click="closeNav">&times;</a>
        <img class = "img-logo" src="../assets/MPRLogo.png">
        <div class="search-container">
            <input type="text" placeholder="Search..." v-model="search" @keyup.enter.stop="findLoc(search,0)"> 
            <button class="searchbtn" @click.stop="findLoc(search,0)" ><i class="fas fa-search" style="color:#66fcf1"></i></button>
        </div>
        <!-- Routing section -->
        
        <div class="myRoute">
            <button @click="drops" class="dropbtn">Find My Route!</button>
            <div id="myDropdown" class="dropdown-content">
                <input type="text" placeholder="Origin" v-model="origin" @keyup.enter.stop="findLoc(origin,1)">
                <input type="text" placeholder="Destination" v-model="dest" @keyup.enter.stop="findLoc(dest,2)"> 
                <input type="time" placeholder="Time" id="myTime" v-model="time" >
                <div class="options">
                    <table class="optionsTab">
                        <tr>
                            <th> <label>Shortest Time</label> </th>
                            <th> <input type="radio"  v-model.number="option" name = "choice" value = 0 > </th>
                            <th> <label>Shortest Dist</label> </th>
                            <th> <input type="radio" v-model.number="option" name = "choice" value = 1 > </th>
                        </tr>
                        <tr>
                            <th><label>Most Popular</label></th>
                            <th><input type="radio"  v-model.number="option" name = "choice" value = 2></th>
                            <th><label>Personalized</label></th>
                            <th><input type="radio"  v-model.number="option" name = "choice" value = 3 > </th>
                        </tr>
                    </table>
                    <button type="submit" @click="findRoute" class="route"><i class="fas fa-car"></i>  Go!</button>
                </div>
            </div>
        </div>
    </div>
</template>
 
<script>
import {eventBus} from '../main.js'

 export default {
     name: "searchbar",
     data() {
         return { //MOTTO 
            origin_latlng: [],
            origin: null,
            dest_latlng: [],
            dest: null,
            time: null,
            search: null,
            option: 0 
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
        closeNav() {
            document.getElementById("mysearch").style.width = "0";
            document.getElementById("map-container").style.width = "100%";
        },
        drops() {
            document.getElementById("myDropdown").classList.toggle("show");
        },
        findLoc(searchQuery, option) {
            if(searchQuery) {
                eventBus.$emit('search-submit', {'query': searchQuery, 'choice': option})
            }
        },
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
                this.drops()
            }
            
        }, 
     }
 }
</script>
 
<style scoped>
    /* left menu */
    .search {
        width: 350px;
        height: 100%;
        position: fixed;
        z-index: 1;
        top: 0;
        left: 0;
        background-color: #767779; 
        overflow-x: hidden; 
        padding-top: 20px;
        transition: 0.5s;
        box-shadow:  0px 8px 16px 0px inset;
    }

    /* ---------- Start Left MPR Menu ------- */
    .img-logo {
        width: 250px;
        padding: 0px 35px;
    }

    .search a {
        display: block;
        transition: 0.3s;
        float: left;
    }

    .search .closebtn {
        position: absolute; 
        cursor: pointer;
        top: 0;
        right: 25px;
        font-size: 36px;
        margin-left: 50px;
        text-decoration: none;
        color: #1f2833;
    }

    .search .search-container {
        float: left;
    }

    .search input[type=text] {
        float: left;
        margin-left: 40px;
        padding: 6px 10px;
        font-size: 17px;
        border: 1px solid black;
        white-space: nowrap;
        overflow:hidden;
    }

    .search .search-container button {
        position: absolute; 
        float: right;
        padding: 6px;
        margin-bottom: 10px;
        background: #1f2833;
        font-size: 17px;
        border: 1px solid black;
        cursor: pointer;
    }

    .search .search-container button:hover {
        background: #0b0c10;
    }

    /* Dropdown Button: Find My Route*/
    .dropbtn {
        background-color: #1f2833;
        color: white;
        float: left;
        margin-top: 20px;
        margin-left: 85px;
        padding: 16px;
        font-size: 22px;
        border: none;
        cursor: pointer;
        white-space: nowrap;
    }
    
    /* Dropdown button on hover & focus */
    .dropbtn:hover, .dropbtn:focus {
        background-color: #0b0c10;
    }
    
    /* The container <div> - needed to position the dropdown content */
    .dropdown {
        position: relative;
        display: block;
    }
    
    /* Dropdown Content (Hidden by Default) */
    .dropdown-content {
        visibility:hidden;
        background-color:#45a29e;
        min-width: 100%;
        overflow:auto;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    }

    .dropdown-content input[type=text] {
        float: left;
        margin-left: 0px;
        width: 93%;
        font-size: 17px;
        border: 1px solid black;
        white-space: nowrap;
        overflow:hidden;
    }

    .dropdown-content input[type=time] {
        float: left;
        margin-left: 0px;
        padding: 5px;
        width: 96%;
        font-size: 17px;
        border: 1px solid black;
        white-space: nowrap;
        overflow:hidden;
    }
    
    /* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
    .show {
        visibility:visible;
        }

        /*  TABLE */
        .optionsTab {
            width: 100%;
            border-spacing: 5px 10px;
            color: #0b0c10;
        }

        /* Table and submit button*/
        .options {
            float:left;
            width: 100%;
            white-space: nowrap;
            margin-top: 10px;
            margin-left:0px;
            transition: all 0.3s ease-in-out 0s, visibility 0s linear 0.3s, z-index 0s linear 0.01s;
            transform: translateY(0%);
            transition-delay: 0s, 0s, 0.3s;
        }

        /* GO */
    .route {
        background-color: #1f2833;
        color: white;
        float: left;
        margin-left: 0;
        margin-top: 20px;
        width: 100%;
        height: 30px;
        font-size: 19px;
        border: none;
        cursor: pointer;
        white-space: nowrap;
    }

    .route:hover {
        background-color: #0b0c10;
    }
 </style>
 