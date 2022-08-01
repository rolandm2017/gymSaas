import express from "express";
// https://medium.com/swlh/how-to-implement-google-places-api-in-your-application-js-express-node-js-97b16da24835
// const dotenv = require("dotenv").config();
import dotenv from "dotenv";
import axios, { AxiosResponse } from "axios";

import { createGym } from "../database/dao/gym.dao";

// const dotenvConfig = dotenv.config();
dotenv.config();

class GymFinderService {
    // private bareRequest;
    private key = process.env.GOOGLE_PLACES_API_KEY;

    constructor() {}

    public async findGymsInLocation(country: string, province: string, city: string) {
        // TODO: refuse query if query was done within the past 24 hours (before making it to this method)
        const gyms: any[] = [];
        // initial request
        const request: string = this.embedLocation(country, province, city);
        let response: AxiosResponse<any, any> = await this.requestGyms(request);
        const results = response.data.results;
        gyms.push(results);
        const firstNextPgToken = response.data.next_page_token;

        // gather future responses
        let counter = 0;
        let nextPageToken = firstNextPgToken;
        console.log(nextPageToken.slice(0, 20), counter, 24);
        await new Promise(r => setTimeout(r, 2000));
        while (nextPageToken && counter < 5) {
            const nextResponse: AxiosResponse<any, any> = await this.requestGyms(request, nextPageToken);
            const nextPlacesBatch = nextResponse.data.results;
            nextPageToken = nextResponse.data.next_page_token;
            gyms.push(nextPlacesBatch);
            counter++;
            // as per https://python.gotrained.com/google-places-api-extracting-location-data-reviews/#Search_for_Places
            // "There is a delay until the  next_page_token is issued and validated. So you need to put a small sleep time
            // like 2 seconds between each request. Otherwise, you will get an  INVALID_REQUEST status."
            await new Promise(r => setTimeout(r, 2000));
            console.log(nextPageToken ? nextPageToken.slice(0, 20) : null, counter, "30rm");
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

    public async saveGyms(gyms: object[]) {
        // TODO: save gyms to db
        // const placeholderGym = {
        //     id: 2,
        //     city: "Vancouver",
        //     street: "Premier",
        //     url: "www.google.ca",
        //     lat: 20,
        //     long: 25,
        // };
        await createGym(placeholderGym);
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
