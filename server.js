const {Client} = require("@googlemaps/google-maps-services-js");

const client = new Client({});

var axios = require('axios');
var config = {
  method: 'get',
  url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522%2C151.1957362&radius=1500&type=restaurant&keyword=cruise&key=' + key,
  headers: { }
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});


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