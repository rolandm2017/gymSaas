import express from "express";
// https://medium.com/swlh/how-to-implement-google-places-api-in-your-application-js-express-node-js-97b16da24835
// const dotenv = require("dotenv").config();
import dotenv from "dotenv";
import axios, { AxiosResponse } from "axios";

import { createGym, getMultipleGyms } from "../database/dao/gym.dao";
import { IGym } from "../interface/Gym.interface";
import { Gym, GymCreationAttributes } from "../database/models/Gym";

// const dotenvConfig = dotenv.config();
dotenv.config();

class GymFinderService {
    // private bareRequest;
    private key = process.env.GOOGLE_PLACES_API_KEY;

    constructor() {}

    public async findGymsInLocation(country: string, state: string, city: string): Promise<IGym[]> {
        // TODO: refuse query if query was done within the past 24 hours (before making it to this method)
        const gyms: any[] = [];
        // initial request
        const request: string = this.embedLocation(country, state, city);
        let response: AxiosResponse<any, any> = await this.requestGyms(request);
        const results = this.convertJSONToGyms(response.data.results);
        gyms.push(results);
        const firstNextPgToken = response.data.next_page_token;

        // gather future responses
        let counter = 0;
        let nextPageToken = firstNextPgToken;
        console.log(nextPageToken, counter, 24);
        await new Promise(r => setTimeout(r, 2000));
        const TEMP_LIMIT_FOR_DEVELOPMENT = 5;
        while (nextPageToken && counter < TEMP_LIMIT_FOR_DEVELOPMENT) {
            const nextResponse: AxiosResponse<any, any> = await this.requestGyms(request, nextPageToken);
            const nextPlacesBatch: object[] = nextResponse.data.results;
            nextPageToken = nextResponse.data.next_page_token;
            // convert gyms data to interfaces
            const nextPlacesGyms: IGym[] = this.convertJSONToGyms(nextPlacesBatch);
            gyms.push(nextPlacesGyms);
            break;
            // counter++;
            // // as per https://python.gotrained.com/google-places-api-extracting-location-data-reviews/#Search_for_Places
            // // "There is a delay until the  next_page_token is issued and validated. So you need to put a small sleep time
            // // like 2 seconds between each request. Otherwise, you will get an  INVALID_REQUEST status."
            // await new Promise(r => setTimeout(r, 2000)); // async delay 2 seconds
            // console.log(nextPageToken ? nextPageToken.slice(0, 20) : null, counter, "30rm");
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

    private convertJSONToGyms(gyms: object[]): IGym[] {
        console.log(gyms, "63rm");
        const output: IGym[] = [];
        for (let i = 0; i < gyms.length; i++) {
            const gym: IGym = gyms[i] as IGym;
            gym.lat = gym.geometry.location.lat;
            gym.long = gym.geometry.location.lng;
            output.push(gym);
        }
        return output;
    }

    public async saveGyms(gyms: IGym[], city: string, country: string) {
        // TODO: save gyms to db
        // const placeholderGym = {
        //     id: 2,
        //     city: "Vancouver",
        //     street: "Premier",
        //     url: "www.google.ca",
        //     lat: 20,
        //     long: 25,
        // };
        for (let i = 0; i < gyms.length; i++) {
            const gymCreationAttr: GymCreationAttributes = {
                city: city,
                street: gyms[i].formatted_address,
                country: country,
                url: gyms[i].icon,
                lat: gyms[i].geometry.location.lat,
                long: gyms[i].geometry.location.lng,
                icon: gyms[i].icon,
                name: gyms[i].name,
                rating: gyms[i].rating,
            };
            await createGym(gymCreationAttr);
        }
    }

    public async getSavedGymsFromDB(city: string): Promise<IGym[]> {
        const gymsFromDb = await getMultipleGyms(city);
        const rowsOfGyms: Gym[] = gymsFromDb.rows;
        const gyms: IGym[] = [];
        for (const row of rowsOfGyms) {
            const g: IGym = {
                business_status: "OPERATIONAL",
                formatted_address: "",
                geometry: {
                    location: {
                        lat: row.lat,
                        lng: row.long,
                    },
                },
                icon: "",
                name: "",
                opening_hours: { open_now: true },
                place_id: "",
                rating: 5,
                lat: row.lat,
                long: row.long,
            };
        }
        console.log(gyms, "TODO expecting or trying to get IGym[] here -- 102rm");
        return gyms;
    }
}

// const key = process.env.GOOGLE_PLACES_API_KEY;

// const request = `https://maps.googleapis.com/maps/api/place/textsearch/json?`
// const query = `query=burgers+chelsea+manhattan+new+york+city&type=restaurant&key=${key}`

export default GymFinderService;
