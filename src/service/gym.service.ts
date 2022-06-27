import express from "express";
// https://medium.com/swlh/how-to-implement-google-places-api-in-your-application-js-express-node-js-97b16da24835
const dotenv = require("dotenv").config();
import axios, { AxiosResponse } from "axios";

class GymFinderService {
    // private bareRequest;
    private key = process.env.GOOGLE_PLACES_API_KEY;

    constructor() {}

    public async findGymsInLocation(country: string, province: string, city: string) {
        const gyms: any[] = [];
        // initial request
        const request: string = this.embedLocation(country, province, city);
        let response: AxiosResponse<any, any> = await this.requestGyms(request);
        const results = response.data.results;
        const firstNextPgToken = response.data.next_page_token;

        // gather future responses
        let counter = 0;
        let nextPageToken = firstNextPgToken;
        while (response.data.next_page_token && counter < 5) {
            const nextResponse: AxiosResponse<any, any> = await this.requestGyms(request, nextPageToken);
            const nextPlacesBatch = nextResponse.data.results;
            nextPageToken = nextResponse.data.next_page_token;
            gyms.push(nextPlacesBatch);
            counter++;
        }

        return gyms.flat();
    }

    private embedLocation(country: string, province: string, city: string): string {
        const gym = "gym";
        return `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${city}+${province}+${country}&type=${gym}&key=${this.key}`;
    }

    private async requestGyms(request: string, token?: string): Promise<AxiosResponse<any, any>> {
        const nextResponse = await axios.get(request, { params: { pagetoken: token } });
        return nextResponse;
    }
}

// const key = process.env.GOOGLE_PLACES_API_KEY;

// const request = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=burgers+chelsea+manhattan+new+york+city&type=restaurant&key=${key}`

// const city = "Vancouver";
// const province = "BC";
// const country = "Canada";

// const totalPlaces = [];

// let request = await requestGyms(bareRequest, "");
// const results = request.data.results;
// let nextPageToken = request.data.next_page_token;
// totalPlaces.push(results);
// let counter = 0;
// while (request.data.next_page_token && counter < 4) {
//     const nextResponse = await requestGyms(bareRequest, nextPageToken);
//     const nextPlacesBatch = nextResponse.data.results;
//     nextPageToken = request.data.next_page_token;
//     totalPlaces.push(nextPlacesBatch);
//     counter++;
// }
// console.log(totalPlaces, totalPlaces.length, 33);
// .then(res => {
//     console.log(res.data.results, res.data.results.length, 20);
//     const nextPageToken = res.data.next_page_token;
//     console.log(nextPageToken, 22)
// })

export default GymFinderService;
