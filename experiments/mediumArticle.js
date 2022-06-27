// https://medium.com/swlh/how-to-implement-google-places-api-in-your-application-js-express-node-js-97b16da24835
const dotenv = require("dotenv").config();
const axios = require("axios");

const key = process.env.GOOGLE_PLACES_API_KEY;


// const request = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=burgers+chelsea+manhattan+new+york+city&type=restaurant&key=${key}`

const gym = "gym"

const city = "Vancouver"
const province = "BC"
const country = "Canada"

const bareRequest =    
`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${city}+${province}+${country}&type=${gym}&key=${key}`

const totalPlaces = [];

let request = await requestGyms(bareRequest, "");
const results = request.data.results
let nextPageToken = request.data.next_page_token;
totalPlaces.push(results)
let counter = 0
while (request.data.next_page_token && counter < 4) {
    const nextResponse = await requestGyms(bareRequest, nextPageToken);
    const nextPlacesBatch = nextResponse.data.results;
    nextPageToken = request.data.next_page_token;
    totalPlaces.push(nextPlacesBatch);
    counter++;
}
console.log(totalPlaces, totalPlaces.length, 33)
// .then(res => {
//     console.log(res.data.results, res.data.results.length, 20);
//     const nextPageToken = res.data.next_page_token;
//     console.log(nextPageToken, 22)
// })

async function requestGyms(request, token) {
    const nextResponse = await axios.get(request, {params: { pagetoken: token }})
    return nextResponse;
}

export default {}; 