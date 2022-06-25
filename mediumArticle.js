// https://medium.com/swlh/how-to-implement-google-places-api-in-your-application-js-express-node-js-97b16da24835

const axios = require("axios")



const request = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=burgers+chelsea+manhattan+new+york+city&type=restaurant&key=${key}`

const gym = "gym"

const city = "Vancouver"
const province = "BC"
const country = "Canada"

const bareRequest =    
`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${city}+${province}+${country}&type=${gym}&key=${key}`

axios.get(bareRequest).then(res => {
    console.log(res.data.results, 20);
})