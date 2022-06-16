var net = require("net");

var elixir_connected = false;
var elixir_pong = true;


var adsb_sock = net.createConnection(30003, "localhost", () => {
        console.log("successful connection on " + adsb_sock.address().address + ":" + "30003")
    }).on("data", (data) => {

        // console.log(data.toString())
        var incoming_string = data.toString().split(",")
        incoming_string[incoming_string.length - 1].trim()
        var ADSB_AIRCRAFT_REC = {
            ICAO_AC_CODE: incoming_string[5],     
            MSG_TYPE: incoming_string[0],
            TRANS_TYPE: incoming_string[1],
            DATE_GENERATED: incoming_string[6],
            TIME_GENERATED: incoming_string[7],
            DATE_LOGGED: incoming_string[8],
            TIME_LOGGED: incoming_string[9],
            MSG_CALLSIGN: incoming_string[10],
            MSG_ALTITUDE: incoming_string[11],
            MSG_GROUND_SPD: incoming_string[12],
            MSG_TRACK_HEADING: incoming_string[13],
            MSG_LATITUDE: incoming_string[14],
            MSG_LONGITUDE: incoming_string[15],
            MSG_VERTICAL_RATE: incoming_string[16],
            MSG_SQUAWK_CODE: incoming_string[17],
            MSG_ALERT_SQUAWK_CODE: incoming_string[18],
            MSG_EMERGENCY: incoming_string[19],
            MSG_TRANSPONDER_ID: incoming_string[20],
            MSG_IS_ON_GROUND: incoming_string[21]
    }

    // console.log(ADSB_AIRCRAFT_REC)
    console.log(JSON.stringify(ADSB_AIRCRAFT_REC).length)
    try {
       if (elixir_connected = true) {
            elixir_sock.bufferSize = 10
            elixir_sock.write("////" + JSON.stringify(ADSB_AIRCRAFT_REC) + "----")
        
        //console.log(elixir_sock.read().toString)
       }
    } catch(err) {
        console.log(err)
    }
})

var elixir_sock = net.createConnection(4040, "localhost", () => {
    console.log("successful connection to elixir app on " + elixir_sock.address().address + ":4040")
    elixir_connected = true;


}).on("data", (data) => {
    console.log(data.toString())
})