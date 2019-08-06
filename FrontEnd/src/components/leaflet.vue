<template>
  <div style="height:100%" id="map-container">
    <!-- Button does show up, but need to change z-index of things-->
    <div style="z-index:2;"> <v-btn>alarm</v-btn> </div>
  </div>
</template>

<script>
import measure from "../leaflet/leaflet.measure.js";
import {
  blueIcon,
  redIcon,
  greenIcon,
  orangeIcon,
  yellowIcon,
  violetIcon,
  greyIcon,
  blackIcon
} from "../leaflet/leaflet-color-markers.js";

import lrm from "../leaflet/leaflet-routing-machine.js";
import { eventBus } from "../main.js";
import easyButton from "leaflet-easybutton";
import proj4 from "proj4";
import heatmap from "leaflet.heat";

//custom leaflet popups test
// create popup contents
var customPopup =
  "<button> Start from this location </button> <br/><v-btn>Go to this location</v-btn>";

// specify popup options
var customOptions = {
  maxWidth: "500",
  className: "custom"
};

export default {
  name: "leaflet",
  props: {
    userId: null,
    routeQuery: {
      origin: null,
      destination: null,
      time: null
    }
  },
  data() {
    return {
      mymap: null, //Interactive map
      OMStile: null,
      //searchMark, origin, destination markers
      searchMark: {},
      origin: {},
      destination: {},
      user: {},
      pRoute: [], //personalized route
      measureTool: null,
      geocoder: null,
      router: null, //leaflet routing machine
      heatData: [],
      heatLayer: null
    };
  },
  mounted() {
    //initialize map
    this.initMap();
    this.locateUser();
    //this.trajectories(); //temporary trajectories
    //this.rtest();

    //event handler to geocode an address to return lat and long for map
    eventBus.$on("search-submit", search => {
      //console.log("This is search: " + search.query + " This is choice: " + search.choice);
      this.geocoder.geocode(search.query, result => {
        //console.log(result);
        this.mymap.closePopup();
        //removes old marker
        if (this.searchMark != undefined) {
          this.mymap.removeLayer(this.searchMark);
        }

        if (search.choice == 0) {
          //from search
          this.searchMark = L.marker(
            [result[0].center.lat, result[0].center.lng],
            { icon: greenIcon }
          )
            .addTo(this.mymap)
            //hihi
            .bindPopup(customPopup, customOptions)
            .openPopup();
          eventBus.$emit("fill-fields", {
            name: result[0].name,
            choice: search.choice
          });
        } else if (search.choice == 1) {
          //from origin
          if (this.origin != undefined) {
            this.mymap.removeLayer(this.origin);
          }
          this.origin = L.marker([result[0].center.lat, result[0].center.lng], {
            icon: violetIcon
          })
            .addTo(this.mymap)
            .bindPopup(result[0].name)
            .openPopup();
          eventBus.$emit("fill-fields", {
            name: result[0].name,
            choice: search.choice,
            coord: [result[0].center.lat, result[0].center.lng]
          });
        } else if (search.choice == 2) {
          if (this.destination != undefined) {
            //from dest
            this.mymap.removeLayer(this.destination);
          }
          this.destination = L.marker(
            [result[0].center.lat, result[0].center.lng],
            { icon: violetIcon }
          )
            .addTo(this.mymap)
            .bindPopup(result[0].name)
            .openPopup();
          eventBus.$emit("fill-fields", {
            name: result[0].name,
            choice: search.choice,
            coord: [result[0].center.lat, result[0].center.lng]
          });
        } else if (search.choice == 3) {
          // from destination validation
          if (this.destination != undefined) {
            //from dest
            this.mymap.removeLayer(this.destination);
          }
          this.destination = L.marker(
            [result[0].center.lat, result[0].center.lng],
            { icon: violetIcon }
          )
            .addTo(this.mymap)
            .bindPopup(result[0].name)
            .openPopup();
          eventBus.$emit("fill-fields", {
            name: result[0].name,
            choice: 4,
            coord: [result[0].center.lat, result[0].center.lng]
          });
        } else if (search.choice == 4) {
          //from origin validation
          if (this.origin != undefined) {
            this.mymap.removeLayer(this.origin);
          }
          this.origin = L.marker([result[0].center.lat, result[0].center.lng], {
            icon: violetIcon
          })
            .addTo(this.mymap)
            .bindPopup(result[0].name)
            .openPopup();
          eventBus.$emit("fill-fields", {
            name: result[0].name,
            choice: 5,
            coord: [result[0].center.lat, result[0].center.lng]
          });
        }
        this.mymap.setView([result[0].center.lat, result[0].center.lng], 13);
      });
    });

    //event handler to give route to user
    //Options include shortest distance, shortest duration/ time, personalized, and "popular"
    //NOT COMPLETE
    eventBus.$on("find-route", query => {
      let _this = this;
      //shortest distance and shortest time - option 2 is temporary
      if (query.option == 0) {
        var waypoints = [
          new L.Routing.Waypoint(L.latLng(query.orig[0], query.orig[1]), "A"),
          new L.Routing.Waypoint(L.latLng(query.dest[0], query.dest[1]), "B")
        ];
        this.router.setWaypoints(waypoints);
        this.router.route();
        this.router.addTo(this.mymap);
      } else if (query.option == 1) {
        //testRoute_shen2 -- need to convert to lat and long first
        this.$http
          .get("http://35.238.228.84:3050/trajectory", {
            params: {
              src: 64648,
              dest: 62934
            }
          })
          .then(function(response) {
            //note: utm zone hardcoded for shenzhen city
            var utm = "+proj=utm +zone=49";
            var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

            var tmp;
            var latlngs = [];
            console.log("response = ", response);
            var utmcoords = response.data.data;
            //proj4 input [projection of source, desired projection, easting, northing]
            //proj4 output [long, lat]
            var tmp = [];
            for (var i = 0; i < utmcoords.length; i++) {
              tmp = proj4(utm, wgs84, [utmcoords[i][1], utmcoords[i][0]]);
              latlngs.push([tmp[1], tmp[0]]);
            }

            // // does not give me the proper sequence of vertices??
            // var polyline = L.polyline(latlngs, { color: "red" }).addTo(
            //   _this.mymap
            // );
            // _this.mymap.fitBounds(polyline.getBounds());

            //points
            for (var i = 0; i < latlngs.length; i++) {
              L.marker([latlngs[i][0], latlngs[i][1]]).addTo(_this.mymap);
            }

            var url = "https://api.mapbox.com/matching/v5/mapbox/driving/";
            var tmp2 = "";
            for (var i = 0; i < latlngs.length; i++) {
              if (i == latlngs.length - 1) {
                tmp2 = tmp2.concat(
                  latlngs[i][1].toString(),
                  ",",
                  latlngs[i][0].toString()
                );
              } else {
                tmp2 = tmp2.concat(
                  latlngs[i][1].toString(),
                  ",",
                  latlngs[i][0].toString(),
                  ";"
                );
              }
            }

            url = url.concat(
              tmp2,
              "?geometries=geojson&access_token=pk.eyJ1IjoiYWEtdmFyaXl1biIsImEiOiJjanZzYmhja2QxM2l5NGFvOHpqdXhiNDJvIn0.ez9bRvvx0eg9RZVmjiTPpQ"
            );
            _this.$http
              .get(url)
              .then(function(route) {
                console.log("Lat and Long: ", latlngs);
                console.log("MAP MATCHING ---: ", route);
                var match = route.data.matchings;
                if (match.length != 0) {
                  for (var i = 0; i < match.length; i++) {
                    var coords = match[i].geometry.coordinates;
                    var tmp = [];
                    for (var j = 0; j < coords.length; j++) {
                      tmp.push([coords[j][1], coords[j][0]]);
                    }
                    var polyline = L.polyline(tmp, { color: "red" }).addTo(
                      _this.mymap
                    );
                    _this.mymap.fitBounds(polyline.getBounds());
                  }

                  // console.log('UTM: ', utm.convertUtmToLatLng())
                } else {
                  alert("Route could not be matched!");
                }
              })
              .catch(function(error) {
                console.log(error);
              });
          });
      } else if (query.option == 2) {
        //testRoute_shen2 - mapbox map matching
        this.$http
          .get("http://demo5390470.mockable.io/shen")
          .then(function(response) {
            var tmp;
            var latlngs = response.data;

            //  for (var i = 0; i < response.data.ID.length; i++) {
            //      tmp = L.latLng(response.data.begin.lat[i], response.data.begin.lng[i])
            //      latlngs.push(tmp)
            //      tmp = L.latLng(response.data.end.lat[i], response.data.end.lng[i])
            //      latlngs.push(tmp)
            // }

            //console.log(latlngs)
            // var polyline = L.polyline(latlngs, {color: 'red'}).addTo(_this.mymap);
            // _this.mymap.fitBounds(polyline.getBounds());

            /*
                       var control = L.Routing.control({
                           waypoints: latlngs,
                           show:false,
                           waypointMode: 'snap',
                           createMarker: function () {}
                       }).addTo(_this.mymap); */

            //Mapbox map matching api - give lng,lat;,lng,lat;....

            var url = "https://api.mapbox.com/matching/v5/mapbox/driving/";
            var tmp2 = "";
            for (var i = 0; i < latlngs.ID.length; i++) {
              if (i == latlngs.ID.length - 1) {
                tmp2 = tmp2.concat(
                  // latlngs.begin.lng[i].toString(),
                  // ",",
                  // latlngs.begin.lat[i].toString(),
                  // ";",
                  latlngs.end.lng[i].toString(),
                  ",",
                  latlngs.end.lat[i].toString()
                );
              } else {
                tmp2 = tmp2.concat(
                  // latlngs.begin.lng[i].toString(),
                  // ",",
                  // latlngs.begin.lat[i].toString(),
                  // ";",
                  latlngs.end.lng[i].toString(),
                  ",",
                  latlngs.end.lat[i].toString(),
                  ";"
                );
              }
            }

            url = url.concat(
              tmp2,
              "?geometries=geojson&access_token=pk.eyJ1IjoiYWEtdmFyaXl1biIsImEiOiJjanZzYmhja2QxM2l5NGFvOHpqdXhiNDJvIn0.ez9bRvvx0eg9RZVmjiTPpQ"
            );
            _this.$http
              .get(url)
              .then(function(route) {
                console.log("Lat and Long: ", latlngs);
                console.log("MAP MATCHING ---: ", route);
                var match = route.data.matchings;
                if (match.length != 0) {
                  for (var i = 0; i < match.length; i++) {
                    var coords = match[i].geometry.coordinates;
                    var tmp = [];
                    for (var j = 0; j < coords.length; j++) {
                      tmp.push([coords[j][1], coords[j][0]]);
                    }
                    var polyline = L.polyline(tmp, { color: "red" }).addTo(
                      _this.mymap
                    );
                    _this.mymap.fitBounds(polyline.getBounds());
                  }

                  for (var i = 0; i < latlngs.ID.length; i++) {
                    L.marker([
                      latlngs.begin.lat[i],
                      latlngs.begin.lng[i]
                    ]).addTo(_this.mymap);
                  }
                } else {
                  alert("Route could not be matched!");
                }
              })
              .catch(function(error) {
                console.log(error);
              });
          })
          .catch(function(error) {
            console.log(error);
          });
      } else if (query.option == 3) {
        //for personalized route -- TESTING -- NOT COMPLETE
        this.$http
          //http://demo5390470.mockable.io/personalized
          .get("http://demo5390470.mockable.io/match")
          .then(function(response) {
            if (_this.pRoute.length != 0) _this.pRoute = [];
            var latlngs = response.data;
            var url = "https://api.mapbox.com/matching/v5/mapbox/driving/";
            var tmp2 = "";
            for (var i = 0; i < latlngs.lat.length; i++) {
              if (i == latlngs.lat.length - 1) {
                tmp2 = tmp2.concat(
                  // latlngs.begin.lng[i].toString(),
                  // ",",
                  // latlngs.begin.lat[i].toString(),
                  // ";",
                  latlngs.lng[i].toString(),
                  ",",
                  latlngs.lat[i].toString()
                );
              } else {
                tmp2 = tmp2.concat(
                  // latlngs.begin.lng[i].toString(),
                  // ",",
                  // latlngs.begin.lat[i].toString(),
                  // ";",
                  latlngs.lng[i].toString(),
                  ",",
                  latlngs.lat[i].toString(),
                  ";"
                );
              }
            }

            url = url.concat(
              tmp2,
              "?geometries=geojson&access_token=pk.eyJ1IjoiYWEtdmFyaXl1biIsImEiOiJjanZzYmhja2QxM2l5NGFvOHpqdXhiNDJvIn0.ez9bRvvx0eg9RZVmjiTPpQ"
            );
            _this.$http
              .get(url)
              .then(function(route) {
                console.log("Lat and Long: ", latlngs);
                console.log("MAP MATCHING ---: ", route);
                var match = route.data.matchings;
                if (match.length != 0) {
                  for (var i = 0; i < match.length; i++) {
                    var coords = match[i].geometry.coordinates;
                    var tmp = [];
                    for (var j = 0; j < coords.length; j++) {
                      tmp.push([coords[j][1], coords[j][0]]);
                    }
                    var polyline = L.polyline(tmp, { color: "red" }).addTo(
                      _this.mymap
                    );
                    _this.mymap.fitBounds(polyline.getBounds());
                  }

                  for (var i = 0; i < latlngs.lat.length; i++) {
                    L.marker([latlngs.lat[i], latlngs.lng[i]]).addTo(
                      _this.mymap
                    );
                  }
                } else {
                  alert("Route could not be matched!");
                }
              })
              .catch(function(error) {
                console.log(error);
              });

            // _this.consec(
            //   response.data.ID,
            //   response.data.begin,
            //   response.data.end
            // );
            // var waypoints = [];
            // //temporary coordinates for testing purposes waypoint(lat,lng)
            // var tmp = new L.Routing.Waypoint(L.latLng(39.9057, 116.4268), "A");
            // waypoints.push(tmp);
            // for (var i = 0; i < _this.pRoute.length; i++) {
            //   tmp = new L.Routing.Waypoint(
            //     L.latLng(_this.pRoute[i].y, _this.pRoute[i].x)
            //   );
            //   waypoints.push(tmp);
            // }
            // tmp = new L.Routing.Waypoint(L.latLng(39.90576, 116.43866), "B");
            // waypoints.push(tmp);
            // console.log(waypoints);
            // //route
            // _this.router.setWaypoints(waypoints);
            // _this.router.route();
            // _this.router.addTo(_this.mymap);
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    });

    //event handler to get trajectory data from all users and generate heatmap to show spatial coverage
    eventBus.$on("show-spatial", onoff => {
      //default options, can change
      var options = {
        maxZoom: 10,
        max: 10.0,
        radius: 30
      };

      if (onoff) {
        if (this.heatData.length == 0) {
          //if no heat map data
          let _this = this;
          this.$http
            .get("http://demo5390470.mockable.io/heat")
            .then(function(response) {
              console.log(response);
              var tmp = response.data.data;
              for (var i = 0; i < tmp.length; i++) {
                var test = [tmp[i][1], tmp[i][0], tmp[i][2]]; //lat long
                _this.heatData.push(test);
              }
              _this.heatLayer = L.heatLayer(_this.heatData, options).addTo(
                _this.mymap
              );
            });
        } else {
          //if there is data, generate heatmap
          this.heatLayer = L.heatLayer(this.heatData, options).addTo(
            this.mymap
          );
        }
      } else {
        //if toggled off clear remove heat layer from map
        if (this.heatLayer != null) this.mymap.removeLayer(this.heatLayer);
      }
    });
  },
  methods: {
    createButton(label, container) {
      var btn = L.DomUtil.create("button", "", container);
      btn.setAttribute("type", "button");
      btn.innerHTML = label;
      return btn;
    },
    //map initialization
    initMap() {
      var OSMtile = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Routes @ <a href="http://project-osrm.org/">OSRM</a>',
          maxZoom: 18
        }
      );
      //mapbox://styles/mapbox/satellite-streets-v11
      var satellite = L.tileLayer(
        "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, Routes @ <a href="http://project-osrm.org/">OSRM</a>',
          maxZoom: 18,
          id: "mapbox.satellite",
          accessToken: "pk.eyJ1IjoiYWEtdmFyaXl1biIsImEiOiJjanZzYmhja2QxM2l5NGFvOHpqdXhiNDJvIn0.ez9bRvvx0eg9RZVmjiTPpQ"
        }
      );
        
      //this.mymap = L.map("map-container").setView([51.0839, -114.1439], 13);
      this.mymap = L.map("map-container", {
        center: [51.0839, -114.1439],
        zoom: 13,
        layers: [OSMtile]
      });
      //adds scale bar
      L.control.scale().addTo(this.mymap);
      //adds layer control to the map
      var defaultTile = { "OpenStreetMap": OSMtile, "Satellite": satellite };
      L.control.layers(defaultTile).addTo(this.mymap);
      //adds measuring tool
      this.measureTool = L.control
        .measure({ position: "topleft" })
        .addTo(this.mymap);
      //adds geocoder
      this.geocoder = new L.Control.Geocoder.Nominatim();
      //adds routing tool
      this.router = new L.Routing.control({
        waypoints: [null],
        addWaypoints: false,
        draggableWaypoints: false
      });

      //adds control to handle errors when finding routes
      //L.Routing.errorControl(control).addTo(this.mymap);
      //asks user for location permission
      this.mymap.on("locationfound", this.onLocationFound);

      let _this = this;

      this.mymap.on("click", function clickLocal(e) {
        var container = L.DomUtil.create("div"),
          //createButton undefined
          startBtn = _this.createButton("Start from this location", container),
          destBtn = _this.createButton("Go to this location", container);

        L.DomEvent.on(startBtn, "click", function() {
          _this.mymap.closePopup();
          _this.setField(e.latlng, 0); //add option
          //when clicked add marker to map
          if (_this.origin != undefined) {
            _this.mymap.removeLayer(_this.origin);
          }
          _this.origin = L.marker(e.latlng, { icon: violetIcon })
            .addTo(_this.mymap)
            .bindPopup("Point of Origin")
            .openPopup();
        });

        L.DomEvent.on(destBtn, "click", function() {
          _this.mymap.closePopup();
          _this.setField(e.latlng, 1); //addoption
          //when clicked add marker to map
          if (_this.destination != undefined) {
            _this.mymap.removeLayer(_this.destination);
          }
          _this.destination = L.marker(e.latlng, { icon: violetIcon })
            .addTo(_this.mymap)
            .bindPopup("Destination")
            .openPopup();
        });

        //disables if measuring tool is active
        if (!_this.measureTool.isMeasure) {
          L.popup()
            .setContent(container)
            .setLatLng(e.latlng)
            .openOn(_this.mymap);
        }
      });

      // return to user location button -- try to change to vuetify stuff
      L.easyButton("fa-crosshairs fa-lg", function(btn, map) {
        _this.mymap.setView(_this.user._latlng, 15);
        _this.user.openPopup();
      }).addTo(this.mymap);
    },

    onLocationError(e) {
      alert(e.message);
    },
    onLocationFound(e) {
      this.user = L.marker(e.latlng, { icon: redIcon })
        .addTo(this.mymap)
        .bindPopup("You are here")
        .openPopup();
      eventBus.$emit("fill-fields", { location: e.latlng, choice: 3 });
    },
    locateUser() {
      this.mymap.locate({ setView: true });
      this.mymap.setZoom(18);
    },
    setField(latlng, choice) {
      eventBus.$emit("set-field", { location: latlng, choice: choice });
    },
    //displays mock trajectories -- delete
    trajectories() {
      let _this = this;
      this.$http
        .get("https://easy-mock.com/mock/5d114866b674851c27217f08/example/traj")
        .then(function(response) {
          console.log(response);
          for (var i = 0; i < response.data.trajectories.lat.length; i++) {
            //console.log("check coords: " + response.data.routes[0].geometry.coordinates[i])
            L.marker([
              response.data.trajectories.lat[i],
              response.data.trajectories.lng[i]
            ]).addTo(_this.mymap);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },

    // Calculates angles between two vertices
    angle(lat, lng, lat2, lng2) {
      var t = (lat * Math.PI) / 180;
      var t2 = (lat2 * Math.PI) / 180;
      var d = ((lng2 - lng) * Math.PI) / 180;

      var y = Math.sin(d) * Math.cos(t2);
      var x =
        Math.cos(t) * Math.sin(t2) - Math.sin(t) * Math.cos(t2) * Math.cos(d);

      var orientation = Math.atan2(y, x);
      orientation *= 180 / Math.PI;

      if (y > 0 && x < 0) {
        orientation += 360;
      } else if (y < 0 || x < 0) {
        orientation += 180;
      }
      while (orientation > 360) {
        orientation -= 360;
      }
      while (orientation < 0) {
        orientation += 360;
      }

      return orientation;
    },

    //joins road segments - Not working super good -- might need to scrap
    consec(ID, begin, end) {
      var brngF = 0.0;
      var brngB = 0.0;
      var diff = 0.0;

      this.pRoute.push({ x: begin.lng[0], y: begin.lat[0] });

      for (var i = 0; i < ID.length - 1; i++) {
        brngB = this.angle(begin.lat[i], begin.lng[i], end.lat[i], end.lng[i]);
        brngF = this.angle(
          begin.lat[i + 1],
          begin.lng[i + 1],
          end.lat[i + 1],
          end.lng[i + 1]
        );

        diff = brngF - brngB;

        //Keep segments seperate if the orientation changes drastically
        if (ID[i + 1] == ID[i] + 1 || (diff > -10 || diff > 10)) {
          if (ID[i + 1] == ID[i] + 1 && (diff < -10 || diff < 10)) {
            this.pRoute.push({ x: end.lng[i], y: end.lat[i] });
            this.pRoute.push({ x: begin.lng[i + 1], y: begin.lat[i + 1] });
          } else {
            continue;
          }
        } else {
          this.pRoute.push({ x: end.lng[i], y: end.lat[i] });
          this.pRoute.push({ x: begin.lng[i + 1], y: begin.lat[i + 1] });
        }
      }
      this.pRoute.push({
        x: begin.lng[ID.length - 1],
        y: begin.lat[ID.length - 1]
      }); //might only need this
      this.pRoute.push({
        x: end.lng[ID.length - 1],
        y: end.lat[ID.length - 1]
      });
    }
  }
};
</script>

<style scoped>
#map-container {
  z-index: 1;
}
</style> 
    