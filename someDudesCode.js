// python

// def search_places_by_coordinate(self, location, radius, types):
//         endpoint_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
//         params = {
//             'location': location,
//             'radius': radius,
//             'types': types,
//             'key': self.apiKey
//         }
//         res = requests.get(endpoint_url, params = params)
//         results = json.loads(res.content)
//         return results

// via https://python.gotrained.com/google-places-api-extracting-location-data-reviews/#Search_for_Places
const axios = require('axios')

const endpointURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
const location = "Vancouver"
const radius = 2555
const types = "gym"

const params = {
                'location': location,
                'radius': radius,
                'types': types,
                'key': apiKey
            }
axios.get(endpointURL, { params: params} ).then(x => {
    console.log(x, 31)
})