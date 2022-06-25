const {Client} = require("@googlemaps/google-maps-services-js");

const client = new Client({});

var axios = require('axios');

const axiosInstance = axios.axiosInstance;

client
  .elevation({
    params: {
      locations: [{ lat: 45, lng: -110 }],
      key: key
    },
    timeout: 1000 // milliseconds
  }, axiosInstance)
  .then(r => {
    // console.log(r.data.results[0].elevation);
    console.log(r.data.results[0].location);
  })


// google.

// service = new google.maps.places.PlacesService(map);
// service.PlacesService.nearbySearch("vancouver").then(x => {
//     console.log(x, 26)
// })
// service.nearbySearch(request, callback);

// client
//   .elevation({
//     params: {
//       locations: [{ lat: 45, lng: -110 }],
//     },
//     timeout: 1000, // milliseconds
//   })
//   .then((r) => {
//     // console.log(r.data.results[0].elevation);
//     console.log(r.data.location);
//   })
//   .catch((e) => {
//     console.log(e.response.data.error_message);
//   });