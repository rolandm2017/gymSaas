// packages
import express from "express";
// https://medium.com/swlh/how-to-implement-google-places-api-in-your-application-js-express-node-js-97b16da24835
// const dotenv = require("dotenv").config();
import dotenv from "dotenv";
// imports
import { IHousing } from "../interface/Housing.interface";
import Parser from "../scrapers/parser";
import { ProviderEnum } from "../enum/provider.enum";
import Scraper from "../scrapers/scraper";
import ScraperConnectionFactory from "../scrapers/connectionFactory";
import { detectViewportSize } from "../util/viewportSizeDetector";
import { IBounds } from "../interface/Bounds.interface";
import LocationDiscoveryService from "./locationDiscovery.service";
import { ILatLong } from "../interface/LatLong.interface";
import { generateGrid } from "../util/gridMaker";
import { AxiosError } from "axios";

// const dotenvConfig = dotenv.config();
dotenv.config();

class ScraperService {
    private scraperConnectionFactory: ScraperConnectionFactory;
    private locationDiscoveryService: LocationDiscoveryService;
    constructor(scraperConnectionFactory: ScraperConnectionFactory, locationDiscoveryService: LocationDiscoveryService) {
        this.scraperConnectionFactory = scraperConnectionFactory;
        this.locationDiscoveryService = locationDiscoveryService;
    }

    public async scrapeApartments(provider: ProviderEnum, city: string, stateOrProvince: string, country: string): Promise<IHousing[]> {
        // check the date of that return [] statement, this code is 3 weeks old and can probably go.
        // when the time comes to run the scraper, we can hide it from the network and /activate via this endpoint.
        // oneshots can also come thru here.
        return [];
    }

    public async detectProviderViewportWidth(provider: ProviderEnum, city: string, stateOrProvince: string, zoomWidth: number): Promise<IBounds> {
        // step 1: discover the viewport width. To be used in the grid maker as "jump" size.
        try {
            const scraper: Scraper = this.scraperConnectionFactory.getScraperOfType(provider);
            const coords = await this.locationDiscoveryService.geocoding("", city, stateOrProvince, "Canada");
            const results = await scraper.scrape(coords.lat, coords.long, provider, zoomWidth);
            console.log(results.length, "43rm");
            const dimensions = detectViewportSize(results);
            return dimensions;
            // todo: put detected width into db so dont have to keep redoing this.
        } catch (err) {
            if (err instanceof AxiosError) {
                console.log("AxiosErrorDetails:");
                console.log(err.code, err.response?.status);
            } else {
                console.log(err);
            }
            // return something to appease the return type
            return { north: 0, south: 0, east: 0, west: 0, latitudeChange: 0, longitudeChange: 0, kmEastWest: 0, kmNorthSouth: 0 };
        }
    }

    public async planGrid(startCoords: ILatLong, bounds: IBounds, radius: number): Promise<ILatLong[]> {
        // TODO: move this into taskQueueService
        // step 2 of 3: plan the grid pattern the apis will scan in.
        // 'theSmallerOfTheTwo' was 1.5923049297275473 upon last inspection.
        const theSmallerOfTheTwo = bounds.kmEastWest > bounds.kmNorthSouth ? bounds.kmNorthSouth : bounds.kmEastWest;
        // choose the smaller of the two distances because we prefer some overlap instead of some space between snapshots
        const subdivisionLocations = generateGrid(startCoords, theSmallerOfTheTwo, radius);
        // todo: retrieve stored grid dimensions if they exist.
        return subdivisionLocations;
    }

    public async getURLForApartment(idFromRentCanada: number): Promise<string> {
        //
        try {
            const scraper: Scraper = this.scraperConnectionFactory.getScraperOfType(ProviderEnum.rentCanada);
            const url = await scraper.fetchUrlForId(idFromRentCanada);
            return url;
        } catch (err) {
            console.log(err);
            console.log("Failed to access scraper");
            return "";
        }
    }
}

export default ScraperService;
