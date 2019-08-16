(function () {
    'use strict';

    var L = require('leaflet');
    var corslite = require('corslite');

    L.Routing = L.Routing || {};

    L.Routing.TomTom = L.Class.extend({
        options: {
            serviceUrl: "https://api.tomtom.com/routing/1/calculateRoute",
            timeout: 30 * 1000,
            routeType: "fastest", // fastest, shortest, eco, thrilling
            language: "", // en-GB
            instructionsType: "", // coded, text, tagged
            traffic: true,
            avoid: "", // [tollRoads, motorways, ferries, unpavedRoads, carpools, alreadyUsedRoads]
            travelMode: "car", // car, truck, taxi, bus, van, motorcycle, bicycle, pedestrian
            vehicleMaxSpeed: 0, // km/h
            vehicleWeight: 0, // kg
            vehicleAxleWeight: 0, // kg
            vehicleLength: 0, // m
            vehicleWidth: 0, // m
            vehicleHeight: 0, // m
            departAt: "", // YYYY-MM-DD\THH:mm:ss
            arriveAt: "", // YYYY-MM-DD\THH:mm:ss
            vehicleCommercial: false
        },

        initialize: function (apiKey, options) {
            this._apiKey = apiKey;
            L.Util.setOptions(this, options);
        },

        route: function (waypoints, callback, context, options) {
            var timedOut = false,
                wps = [],
                url,
                timer,
                wp,
                i;

            options = options || {};
            url = this.buildRouteUrl(waypoints, options);

            timer = setTimeout(function () {
                timedOut = true;
                callback.call(context || callback, {
                    status: -1,
                    message: 'TomTom request timed out.'
                });
            }, this.options.timeout);

            // Create a copy of the waypoints, since they
            // might otherwise be asynchronously modified while
            // the request is being processed.
            for (i = 0; i < waypoints.length; i++) {
                wp = waypoints[i];
                wps.push({
                    latLng: wp.latLng,
                    name: wp.name,
                    options: wp.options
                });
            }

            corslite(url, L.bind(function (err, resp) {
                var data;

                clearTimeout(timer);
                if (!timedOut) {
                    if (!err) {
                        data = JSON.parse(resp.responseText);
                        this._routeDone(data, wps, callback, context);
                    } else {
                        alert("Route could not be found");
                        callback.call(context || callback, {
                            status: -1,
                            message: 'HTTP request failed: ' + JSON.parse(err.responseText).error.description
                        });
                    }
                }
            }, this));

            return this;
        },

        _routeDone: function (response, inputWaypoints, callback, context) {
            var alts = [],
                mappedWaypoints,
                coordinates = [],
                i,
                path,
                summary = [],
                instructions,
                index = 0;

            context = context || callback;
            if (response.error && response.error.description) {
                callback.call(context, {
                    status: -1,
                    message: response.error.description
                });
                return;
            }

            for (i = 0; i < response.routes[0].legs.length; i++) {
                path = response.routes[0].legs[i];
                coordinates = coordinates.concat(this._decodePolyline(path.points));
                index += (path.points.length - 1);
                summary.push({
                    summary: path.summary,
                    index: index
                });
            }

            //instructions = this._convertInstructions(summary);
            instructions = this._convertInstructions(response.routes[0].guidance.instructions);
            mappedWaypoints = this._mapWaypointIndices(inputWaypoints, instructions, coordinates);

            alts = [{
                name: '',
                coordinates: coordinates,
                instructions: instructions,
                summary: this._convertSummary(summary),
                inputWaypoints: inputWaypoints,
                actualWaypoints: mappedWaypoints.waypoints,
                waypointIndices: mappedWaypoints.waypointIndices
            }];

            callback.call(context, null, alts);
        },

        _decodePolyline: function (geometry) {
            var coords = geometry,
                latlngs = new Array(coords.length),
                i;

            for (i = 0; i < coords.length; i++) {
                latlngs[i] = new L.LatLng(coords[i].latitude, coords[i].longitude);
            }

            return latlngs;
        },

        _toWaypoints: function (inputWaypoints, vias) {
            var wps = [],
                i;
            for (i = 0; i < vias.length; i++) {
                wps.push({
                    latLng: L.latLng(vias[i]),
                    name: inputWaypoints[i].name,
                    options: inputWaypoints[i].options
                });
            }

            return wps;
        },

        buildRouteUrl: function (waypoints, options) {
            var locs = [],
                i,
                url = "",
                _options = {
                    routeType: this.options.routeType,
                    language: this.options.language,
                    instructionsType: this.options.instructionsType,
                    traffic: this.options.traffic,
                    avoid: this.options.avoid,
                    travelMode: this.options.travelMode,
                    vehicleMaxSpeed: this.options.vehicleMaxSpeed,
                    vehicleWeight: this.options.vehicleWeight,
                    vehicleAxleWeight: this.options.vehicleAxleWeight,
                    vehicleLength: this.options.vehicleLength,
                    vehicleWidth: this.options.vehicleWidth,
                    vehicleHeight: this.options.vehicleHeight,
                    departAt: this.options.departAt,
                    arriveAt: this.options.arriveAt,
                    vehicleCommercial: this.options.vehicleCommercial
                };

            if (_options.avoid == "" || _options.avoid == [])
                delete _options.avoid;

            if (_options.instructionsType == "")
                delete _options.instructionsType;

            if (_options.language == "")
                delete _options.language;

            if (_options.departAt.match(/^(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/) === null)
                delete _options.departAt;

            if (_options.arriveAt.match(/^(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/) === null)
                delete _options.arriveAt;

            for (i = 0; i < waypoints.length; i++)
                locs.push(waypoints[i].latLng.lat + ',' + waypoints[i].latLng.lng);

            return this.options.serviceUrl + '/' + locs.join(':') + '/json?key=' +
                this._apiKey + '&' + Object.keys(_options).map(function (k) {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(_options[k])
                }).join('&');
        },

        //Note: This function differs from the one seen on GitHub as it had to be modified to work with the app 
        _convertInstructions: function (leg) {
            var result = [],
                i;

            for (i = 0; i < leg.length; i++) {

                var temp = {
                    distance: null,
                    time: null,
                    text: null,
                    type: null,
                    modifier: null
                }
                
                if (leg[i].maneuver === "ARRIVE" || leg[i].maneuver === "ARRIVE_LEFT" || leg[i].maneuver === "ARRIVE_RIGHT") {
                    temp.type = "DestinationReached"
                } else if (leg[i].maneuver === "DEPART") {
                    temp.type = "Head"
                } else if (leg[i].maneuver === "STRAIGHT") {
                    temp.type = "Straight"
                } else if (leg[i].maneuver === "TURN_LEFT") {
                    temp.type = "Left"
                } else if (leg[i].maneuver === "SHARP_LEFT") {
                    temp.type = "SharpLeft"
                } else if (leg[i].maneuver === "BEAR_LEFT") {
                    temp.type = "SlightLeft"
                }else if (leg[i].maneuver === "TURN_RIGHT") {
                    temp.type = "Right"
                } else if (leg[i].maneuver === "SHARP_RIGHT") {
                    temp.type = "SharpRight"
                } else if (leg[i].maneuver === "BEAR_RIGHT") {
                    temp.type = "SlightRight"
                }else if (leg[i].maneuver === "MAKE_UTURN") {
                    temp.type = "TurnAround"
                } else if (leg[i].maneuver === "ENTER_MOTORWAY" || leg[i].maneuver === "ENTER_FREEWAY" || leg[i].maneuver === "ENTER_HIGHWAY") {
                    temp.type = "Straight"
                } else if (leg[i].maneuver === "TAKE_EXIT") {
                    temp.type = "SlightRight"
                } else if (leg[i].maneuver === "MOTORWAY_EXIT_LEFT") {
                    temp.type = "SlightLeft"
                } else if (leg[i].maneuver === "MOTORWAY_EXIT_RIGHT") {
                    temp.type = "SlightRight"
                } else if (leg[i].maneuver === "ROUNDABOUT_RIGHT" || leg[i].maneuver === "ROUNDABOUT_LEFT" || leg[i].maneuver === "ROUNDABOUT_BACK") {
                    temp.type = "Roundabout"
                } else {
                    temp.type = "Straight"
                }

                temp.distance = leg[i].routeOffsetInMeters;
                temp.time = leg[i].travelTimeInSeconds;
                temp.text = leg[i].message;
                temp.modifier = temp.type;

                result.push(temp);
            }
            return result;
        },

        _convertSummary: function (summaries) {
            var result = {
                    totalDistance: 0,
                    totalTime: 0
                },
                i;

            for (i = 0; i < summaries.length; i++) {
                result.totalDistance += summaries[i].summary.lengthInMeters;
                result.totalTime += summaries[i].summary.travelTimeInSeconds;
            }

            return result;
        },

        _mapWaypointIndices: function (waypoints, instructions, coordinates) {
            var wps = [],
                wpIndices = [],
                i,
                idx;

            wpIndices.push(0);
            wps.push({
                latLng: coordinates[0],
                name: waypoints[0].name
            });

            for (i = 0; i < instructions.length; i++) {
                if (instructions[i].type === "WaypointReached") {
                    idx = instructions[i].index;
                    wpIndices.push(idx);
                    wps.push({
                        latLng: coordinates[idx],
                        name: waypoints[wps.length + 1].name
                    });
                }
            }

            wpIndices.push(coordinates.length - 1);
            wps.push({
                latLng: coordinates[coordinates.length - 1],
                name: waypoints[waypoints.length - 1].name
            });

            return {
                waypointIndices: wpIndices,
                waypoints: wps
            };
        }
    });

    L.Routing.tomTom = function (apiKey, options) {
        return new L.Routing.TomTom(apiKey, options);
    };

    //module.exports = L.Routing.TomTom;
})();