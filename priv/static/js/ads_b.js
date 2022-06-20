var aircraft_list = new Map()

var table = document.getElementById("plane_table_rows")
var marker = []
var locations = []

function buildTable() {
    var dicks = ""
    
    
        
    aircraft_list.forEach((plane) => {
        var lat = (plane.lat == "") ? false : plane.lat
        var long = (plane.long == "") ? false : plane.long
        
        if (plane.hex_code != "000000") {
            dicks +=    "<tr id='AC" + plane.hex_code + "' onclick='centerOnPlane(" + lat + ", " + long + ", AC" + plane.hex_code + ")'>" +
                    "<th>" + plane.hex_code + "</th>" +
                    "<td>" + plane.callsign + "</td>" +
                    "<td>" + plane.altitude + "</td>" +
                    "<td>" + plane.ground_speed + "</td>" +
                    "<td>" + plane.track_heading + "</td>" +
                    "<td>" + plane.lat + "</td>" +
                    "<td>" + plane.long + "</td>" +
                    "<td>" + plane.vert_rate + "</td>" +
                    "<td>" + plane.squawk_code + "</td>" +
                    "<td>" + plane.alert + "</td>" +
                    "<td>" + plane.emergency + "</td>" +
                    "<td>" + plane.on_ground + "</td>" +
                    "</tr>"

            locations.push([plane.hex_code, plane.lat, plane.long, plane.track_heading])
        }        
    })

    for (var i=0; i < marker.length; i++) {
        if (!marker) {
            marker[i].remove()
        } else {
            marker[i].remove()
        }
    }

    var plane_icon = L.icon({
        iconUrl: "../images/_plane.png",
        iconSize: [65, 65],
        iconAnchor: [0, 0],
        popupAnchor: [33, -5]
    })
    
    for (var i = 0; i < locations.length; i++) {
        
        marker[i] = new L.marker([locations[i][1], locations[i][2]], {icon: plane_icon}).bindPopup(locations[i][0]).addTo(map)
                
    }

    for (var i = 0; i < marker.length; i++) {
        $("div .leaflet-pane .leaflet-marker-pane").get().forEach((elem) => {
            elem.style.cssText.split(" ")
        })
    }

    
    locations = []
    return dicks;
}


$(() => {
    sock = new WebSocket("ws://localhost:7000/ws/test")

    setInterval(() => {
        $("#plane_table_rows").html(buildTable())}, 2000)

    sock.onopen = function(event) {
        
    }

    sock.onmessage = function(event) {
        var message = event.data

        // console.log(aircraft_list.size)
        // console.log(message)
        if (message.includes("| MSG")) {
            var multiple_messages = message.split("|")

            
            for (var i = 0; i < multiple_messages.length - 1; i++) {
                var msg_split = multiple_messages[i].split(",")
                
                if (aircraft_list.size == 0) {
                
                    // console.log("first instance")
                    var aircraft = new Map()
    
                    aircraft.hex_code            = msg_split[4]
                    aircraft.date_message_logged = msg_split[8]
                    aircraft.time_message_logged = msg_split[9]
                    aircraft.callsign            = msg_split[10] 
                    aircraft.altitude            = msg_split[11] 
                    aircraft.ground_speed        = msg_split[12] 
                    aircraft.track_heading       = msg_split[13] 
                    aircraft.lat                 = msg_split[14] 
                    aircraft.long                = msg_split[15] 
                    aircraft.vert_rate           = msg_split[16] 
                    aircraft.squawk_code         = msg_split[17] 
                    aircraft.alert               = msg_split[18] 
                    aircraft.emergency           = msg_split[19] 
                    aircraft.on_ground           = msg_split[21]
    
    
                    aircraft_list.set(aircraft.hex_code, aircraft)
                } else {
    
                    if (aircraft_list.has(msg_split[4])){
                        // console.log("plane found")
                        
                        var aircraft = new Map()
    
                        aircraft.hex_code            = msg_split[4]
                        aircraft.date_message_logged = msg_split[8]
                        aircraft.time_message_logged = msg_split[9]
                        aircraft.callsign            = (msg_split[10] != "") ? msg_split[10] : aircraft_list.get(msg_split[4]).callsign
                        aircraft.altitude            = (msg_split[11] != "") ? msg_split[11] : aircraft_list.get(msg_split[4]).altitude
                        aircraft.ground_speed        = (msg_split[12] != "") ? msg_split[12] : aircraft_list.get(msg_split[4]).ground_speed
                        aircraft.track_heading       = (msg_split[13] != "") ? msg_split[13] : aircraft_list.get(msg_split[4]).track_heading
                        aircraft.lat                 = (msg_split[14] != "") ? msg_split[14] : aircraft_list.get(msg_split[4]).lat
                        aircraft.long                = (msg_split[15] != "") ? msg_split[15] : aircraft_list.get(msg_split[4]).long
                        aircraft.vert_rate           = (msg_split[16] != "") ? msg_split[16] : aircraft_list.get(msg_split[4]).vert_rate
                        aircraft.squawk_code         = (msg_split[17] != "") ? msg_split[17] : aircraft_list.get(msg_split[4]).squawk_code
                        aircraft.alert               = (msg_split[18] != "") ? msg_split[18] : aircraft_list.get(msg_split[4]).alert
                        aircraft.emergency           = (msg_split[19] != "") ? msg_split[19] : aircraft_list.get(msg_split[4]).emergency
                        aircraft.on_ground           = (msg_split[21] != "") ? msg_split[21] : aircraft_list.get(msg_split[4]).on_ground
    
                        aircraft_list.set(aircraft.hex_code, aircraft)
    
                    } else {
                        // console.log("new plane")
                        
                        var aircraft = new Map()
    
                        aircraft.hex_code            = msg_split[4]
                        aircraft.date_message_logged = msg_split[8]
                        aircraft.time_message_logged = msg_split[9]
                        aircraft.callsign            = msg_split[10] 
                        aircraft.altitude            = msg_split[11] 
                        aircraft.ground_speed        = msg_split[12] 
                        aircraft.track_heading       = msg_split[13] 
                        aircraft.lat                 = msg_split[14] 
                        aircraft.long                = msg_split[15] 
                        aircraft.vert_rate           = msg_split[16] 
                        aircraft.squawk_code         = msg_split[17] 
                        aircraft.alert               = msg_split[18] 
                        aircraft.emergency           = msg_split[19] 
                        aircraft.on_ground           = msg_split[21]
    
                        aircraft_list.set(aircraft.hex_code, aircraft)
                    }
                }
            }   

        } else {
            rm_bar = message.replace("| ", "")
            
            msg_parts = rm_bar.split(",")
            // console.log(msg_parts)

            if (aircraft_list.size == 0) {
                
                // console.log("first instance")
                var aircraft = new Map()

                aircraft.hex_code            = msg_parts[4]
                aircraft.date_message_logged = msg_parts[8]
                aircraft.time_message_logged = msg_parts[9]
                aircraft.callsign            = msg_parts[10] 
                aircraft.altitude            = msg_parts[11] 
                aircraft.ground_speed        = msg_parts[12] 
                aircraft.track_heading       = msg_parts[13] 
                aircraft.lat                 = msg_parts[14] 
                aircraft.long                = msg_parts[15] 
                aircraft.vert_rate           = msg_parts[16] 
                aircraft.squawk_code         = msg_parts[17] 
                aircraft.alert               = msg_parts[18] 
                aircraft.emergency           = msg_parts[19] 
                aircraft.on_ground           = msg_parts[21]


                aircraft_list.set(aircraft.hex_code, aircraft)
            } else {

                if (aircraft_list.has(msg_parts[4])){
                    // console.log("plane found")
                    
                    var aircraft = new Map()

                    aircraft.hex_code            = msg_parts[4]
                    aircraft.date_message_logged = msg_parts[8]
                    aircraft.time_message_logged = msg_parts[9]
                    aircraft.callsign            = (msg_parts[10] != "") ? msg_parts[10] : aircraft_list.get(msg_parts[4]).callsign
                    aircraft.altitude            = (msg_parts[11] != "") ? msg_parts[11] : aircraft_list.get(msg_parts[4]).altitude
                    aircraft.ground_speed        = (msg_parts[12] != "") ? msg_parts[12] : aircraft_list.get(msg_parts[4]).ground_speed
                    aircraft.track_heading       = (msg_parts[13] != "") ? msg_parts[13] : aircraft_list.get(msg_parts[4]).track_heading
                    aircraft.lat                 = (msg_parts[14] != "") ? msg_parts[14] : aircraft_list.get(msg_parts[4]).lat
                    aircraft.long                = (msg_parts[15] != "") ? msg_parts[15] : aircraft_list.get(msg_parts[4]).long
                    aircraft.vert_rate           = (msg_parts[16] != "") ? msg_parts[16] : aircraft_list.get(msg_parts[4]).vert_rate
                    aircraft.squawk_code         = (msg_parts[17] != "") ? msg_parts[17] : aircraft_list.get(msg_parts[4]).squawk_code
                    aircraft.alert               = (msg_parts[18] != "") ? msg_parts[18] : aircraft_list.get(msg_parts[4]).alert
                    aircraft.emergency           = (msg_parts[19] != "") ? msg_parts[19] : aircraft_list.get(msg_parts[4]).emergency
                    aircraft.on_ground           = (msg_parts[21] != "") ? msg_parts[21] : aircraft_list.get(msg_parts[4]).on_ground

                    aircraft_list.set(aircraft.hex_code, aircraft)

                } else {
                    // console.log("new plane")
                    
                    var aircraft = new Map()

                    aircraft.hex_code            = msg_parts[4]
                    aircraft.date_message_logged = msg_parts[8]
                    aircraft.time_message_logged = msg_parts[9]
                    aircraft.callsign            = msg_parts[10] 
                    aircraft.altitude            = msg_parts[11] 
                    aircraft.ground_speed        = msg_parts[12] 
                    aircraft.track_heading       = msg_parts[13] 
                    aircraft.lat                 = msg_parts[14] 
                    aircraft.long                = msg_parts[15] 
                    aircraft.vert_rate           = msg_parts[16] 
                    aircraft.squawk_code         = msg_parts[17] 
                    aircraft.alert               = msg_parts[18] 
                    aircraft.emergency           = msg_parts[19] 
                    aircraft.on_ground           = msg_parts[21]

                    aircraft_list.set(aircraft.hex_code, aircraft)
                }
            }
        }
        // console.log(aircraft_list)
    }

})
