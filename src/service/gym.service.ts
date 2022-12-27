import express from "express";
// https://medium.com/swlh/how-to-implement-google-places-api-in-your-application-js-express-node-js-97b16da24835
// const dotenv = require("dotenv").config();
import dotenv from "dotenv";
import axios, { AxiosResponse } from "axios";

import { IGym } from "../interface/Gym.interface";
import { Gym, GymCreationAttributes } from "../database/models/Gym";
import { gymDbEntryToIGym } from "../util/gymDbEntryToIGym";
import GymDAO from "../database/dao/gym.dao";
import GooglePlacesAPI from "../api/googlePlaces";
import CacheService from "./cache.service";
import { ICityIdAndName } from "../interface/CityIdAndName.interface";

// const dotenvConfig = dotenv.config();
dotenv.config();

class GymService {
    private gymDAO: GymDAO;
    private cacheService: CacheService;
    private googlePlacesAPI: GooglePlacesAPI;

    constructor(gymDAO: GymDAO, cacheService: CacheService, googlePlacesAPI: GooglePlacesAPI) {
        this.gymDAO = gymDAO;
        this.cacheService = cacheService;
        this.googlePlacesAPI = googlePlacesAPI;
    }

    public async findGymsInLocation(country: string, state: string, city: string): Promise<IGym[]> {
        // TODO: refuse query if query was done within the past 24 hours (before making it to this method)
        let gyms: IGym[] = [];
        // initial request
        const request: string = this.googlePlacesAPI.embedLocation(country, state, city);
        let response: AxiosResponse<any, any> = await this.googlePlacesAPI.requestGyms(request);
        const results: IGym[] = this.convertJSONToGyms(response.data.results);
        gyms = [...gyms, ...results];
        const firstNextPgToken = response.data.next_page_token;

        // gather future responses
        let counter = 0;
        let nextPageToken = firstNextPgToken;
        await new Promise(r => setTimeout(r, 2000));
        // const TEMP_LIMIT_FOR_DEVELOPMENT = 5;
        while (nextPageToken) {
            const nextResponse: AxiosResponse<any, any> = await this.googlePlacesAPI.requestGyms(request, nextPageToken);
            const nextPlacesBatch: any[] = nextResponse.data.results;
            nextPageToken = nextResponse.data.next_page_token;
            // convert gyms data to interfaces
            const nextPlacesGyms: IGym[] = this.convertJSONToGyms(nextPlacesBatch);
            gyms = [...gyms, ...nextPlacesGyms];
            // break;
            counter++;
            // // as per https://python.gotrained.com/google-places-api-extracting-location-data-reviews/#Search_for_Places
            // // "There is a delay until the  next_page_token is issued and validated. So you need to put a small sleep time
            // // like 2 seconds between each request. Otherwise, you will get an  INVALID_REQUEST status."
            await new Promise(r => setTimeout(r, 2000)); // async delay 2 seconds
        }

        return gyms;
    }

    private convertJSONToGyms(gyms: any[]): IGym[] {
        const output: IGym[] = [];
        for (let i = 0; i < gyms.length; i++) {
            const gym: IGym = gyms[i] as IGym;
            gym.lat = gym.geometry.location.lat;
            gym.long = gym.geometry.location.lng;
            gym.formatted_address = gym.formatted_address;
            gym.business_status = "OPERATIONAL";
            output.push(gym);
        }
        return output;
    }

    public async saveGyms(gyms: IGym[], cityName: string) {
        // will be used for one city at a time.
        let successes = 0;
        const cityId = await this.cacheService.getCityId(cityName);
        for (let i = 0; i < gyms.length; i++) {
            try {
                const gymCreationAttr: GymCreationAttributes = {
                    cityName,
                    address: gyms[i].formatted_address,
                    url: gyms[i].icon,
                    lat: gyms[i].lat,
                    long: gyms[i].long,
                    icon: gyms[i].icon,
                    name: gyms[i].name,
                    rating: gyms[i].rating,
                    cityId: cityId,
                };
                await this.gymDAO.createGym(gymCreationAttr);
                successes++;
            } catch (err) {
                if (err instanceof Error && err.name === "SequelizeUniqueConstraintError") {
                    console.log("duplicate entry detected!");
                } else {
                    console.log(err);
                }
            }
        }
        return { successes, failures: gyms.length - successes };
    }

    public async getSavedGymsFromDB(city: string): Promise<Gym[]> {
        const gymsFromDb = await this.gymDAO.getMultipleGyms(city);
        const rowsOfGyms: Gym[] = gymsFromDb.rows;
        return rowsOfGyms;
        // const gyms: IGym[] = [];
        // for (const row of rowsOfGyms) {
        //     const g: IGym = gymDbEntryToIGym(row);
        //     gyms.push(g);
        // }
        // return gyms;
    }

    public async correctNullEntries() {
        const entriesToCorrect: Gym[] = await this.gymDAO.getEntriesWithNullCityId();
        const namesOfMissingCities = Array.from(new Set(entriesToCorrect.map(gym => gym.cityName)));
        const correctedGymsTally = [];
        for (const cityName in namesOfMissingCities) {
            const correspondingCityId = await this.cacheService.getCityId(cityName);
            const correspondingEntriesToCorrect = entriesToCorrect.filter(gym => gym.cityName === cityName);
            const corrected = await this.gymDAO.addCityIdToGyms(correspondingEntriesToCorrect, correspondingCityId);
            correctedGymsTally.push(corrected);
        }
        return correctedGymsTally;
    }

    public async countGymsByCity() {
        const allGyms = await this.gymDAO.getAllGyms();
        const cityNamesOnly = allGyms.map(gym => gym.cityName);
        const counted = cityNamesOnly.reduce(function (prev: any, cur: string) {
            prev[cur] = (prev[cur] || 0) + 1;
            return prev;
        }, {});
        return counted;
    }

    public async getAllGyms() {
        const gyms = await this.gymDAO.getAllGyms();
        return gyms;
    }

    public async deleteAll() {
        const affected = await this.gymDAO.deleteAllGyms();
        return affected;
    }
}

// example queries
// const request = `https://maps.googleapis.com/maps/api/place/textsearch/json?`
// const query = `query=burgers+chelsea+manhattan+new+york+city&type=restaurant&key=${key}`

export default GymService;
