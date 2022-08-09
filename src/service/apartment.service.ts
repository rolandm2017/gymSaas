import express from "express";
// https://medium.com/swlh/how-to-implement-google-places-api-in-your-application-js-express-node-js-97b16da24835
// const dotenv = require("dotenv").config();
import dotenv from "dotenv";

import fs from "fs";
import path from "path";

import axios from "axios";

import { IHousing } from "../interface/Housing.interface";
import Parser from "../util/parser";
import { Provider } from "../enum/provider.enum";

const rc = require("../../hardcodeReplies/rentCanada.json");
const rf = require("../../hardcodeReplies/rentFaster.json");
const rs = require("../../hardcodeReplies/rentSeeker.json");

// const dotenvConfig = dotenv.config();
dotenv.config();

class ApartmentScraperService {
    constructor() {}

    public async scrapeApartments(country: string, state: string, city: string): Promise<IHousing[]> {
        // fwd request to Flask scraper services.
        // Note: Expect scraping to take 5-10 minutes in the future, when we have 4 scrapers handling 1 to 100 screens worth of data.
        return [];
    }

    public async getDummyData(provider: string): Promise<IHousing[]> {
        // open data based on input string
        let rawData;
        let unprocessedHousingData;
        let path;
        console.log(__dirname, "31rm");
        if (provider === Provider.rentCanada) {
            path = __dirname + "/../../hardcodeReplies/rentCanada.json";
            // const path2 = __dirname + "/../../hardcodeReplies/rentCanadaPg2.json";
        } else if (provider === Provider.rentFaster) {
            path = __dirname + "/../../hardcodeReplies/rentFaster.json";
        } else if (provider === Provider.rentSeeker) {
            path = __dirname + "/../../hardcodeReplies/rentSeeker.json";
        } else {
            throw new Error("Provider not included or invalid");
        }
        rawData = fs.readFileSync(path, "utf8");
        unprocessedHousingData = JSON.parse(rawData);
        console.log(typeof rawData, rawData.length, unprocessedHousingData.length, "49rm");

        const parser = new Parser(provider);

        return parser.parse(unprocessedHousingData);
    }
}

export default ApartmentScraperService;
