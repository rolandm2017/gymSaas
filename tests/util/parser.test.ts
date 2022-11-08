import { ProviderEnum } from "../../src/enum/provider.enum";
import Parser from "../../src/util/parser";
import { realResultsRentCanada } from "../mocks/realResults/rentCanada";
import { realResultsRentFaster } from "../mocks/realResults/rentFaster";
import { realResultsRentSeeker } from "../mocks/realResults/rentSeeker";

const p = new Parser(ProviderEnum.rentCanada);

describe("test various scraper inputs", () => {
    test("rentCanada", () => {
        //
        const apList = p.parseRentCanada(realResultsRentCanada);
        expect(apList.length).toEqual(realResultsRentCanada.results.listings.length);
    });
    test("rentFaster", () => {
        //
        const apList = p.parseRentFaster(realResultsRentFaster);
        expect(apList.length).toEqual(realResultsRentFaster.results.listings.length);
    });
    test("rentSeeker", () => {
        //
        const apList = p.parseRentSeeker(realResultsRentSeeker);
        expect(apList.length).toEqual(realResultsRentSeeker.results.hits.length);
    });
});
