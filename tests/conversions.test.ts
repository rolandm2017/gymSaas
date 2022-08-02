import { maxDegreesLatitude } from "../src/util/constants";
import {
    convertKMChangeToLatLong,
    convertProgressTowardsNorthPoleAsPercentage,
    northSouthChangeInKMToLatitudeDegrees,
    eastWestChangeInKMToLongitudeDegrees,
} from "../src/util/conversions";

// todo: kmChangeToLatlong
const outOfBoundsLatitude = 91;
const southernHemisphereLatitude = -1;
const outOfBoundsLongitude = 181;
const outOfBoundsLongitude2 = -181;

describe("Testing conversions from lat,long => km and vice versa", () => {
    test("two number inputs should yield a number between 0 and 1", () => {
        expect(convertProgressTowardsNorthPoleAsPercentage(1)).toBe(1 / maxDegreesLatitude);
        expect(convertProgressTowardsNorthPoleAsPercentage(89)).toBe(89 / maxDegreesLatitude);
    });
    test("should throw for invalid values", () => {
        expect(() => {
            convertProgressTowardsNorthPoleAsPercentage(southernHemisphereLatitude);
        }).toThrow("Southern hemisphere not yet served by application logic");
        expect(() => {
            convertProgressTowardsNorthPoleAsPercentage(outOfBoundsLatitude);
        }).toThrow("Latitude out bounds");
    });
});

describe("Accurately convert travelling north/south in km to latitude", () => {
    const oneKM = 1;
    const oneKMSouth = -1;
    test("Regardless of position, one degree north or south is 111 km", () => {
        expect(northSouthChangeInKMToLatitudeDegrees(111, 50)).toBe(50 + oneKM);
        expect(northSouthChangeInKMToLatitudeDegrees(111, 80)).toBe(80 + oneKM);
        expect(northSouthChangeInKMToLatitudeDegrees(111, 10)).toBe(10 + oneKM);
        expect(northSouthChangeInKMToLatitudeDegrees(-111, 50)).toBe(50 + oneKMSouth);
        expect(northSouthChangeInKMToLatitudeDegrees(-111, 80)).toBe(80 + oneKMSouth);
        expect(northSouthChangeInKMToLatitudeDegrees(-111, 10)).toBe(10 + oneKMSouth);
    });
});

describe("Accurately convert travelling east/west in km to longitude", () => {
    const startLong1 = 100;
    const startLong2 = 150;
    const startLong3 = 10;

    const oneKM = 1;

    const tooCloseToNorthPole1 = 9.93;
    const tooCloseToNorthPole2 = 1;
    const tooCloseToNorthPole3 = 5;
    test("At the Equator, 111.321 km east is 1 deg longitude", () => {
        expect(eastWestChangeInKMToLongitudeDegrees(111.321, 0, startLong1)).toBe(startLong1 + oneKM);
        expect(eastWestChangeInKMToLongitudeDegrees(111.321, 0, startLong2)).toBe(startLong2 + oneKM);
        expect(eastWestChangeInKMToLongitudeDegrees(111.321, 0, startLong3)).toBe(startLong3 + oneKM);
    });
    test("An input of 0 yields the starting coordinate", () => {
        expect(eastWestChangeInKMToLongitudeDegrees(0, 90, startLong1)).toBe(startLong1);
        expect(eastWestChangeInKMToLongitudeDegrees(0, 90, startLong2)).toBe(startLong2);
        expect(eastWestChangeInKMToLongitudeDegrees(0, 90, startLong3)).toBe(startLong3);
    });
    test("At various latitudes, a movement east/west converts to appropriate longitude", () => {});

    test("Throws errors for non-supported values", () => {
        expect(() => {
            eastWestChangeInKMToLongitudeDegrees(0, outOfBoundsLatitude, 100);
        }).toThrow("Latitude out bounds");
        expect(() => {
            eastWestChangeInKMToLongitudeDegrees(0, southernHemisphereLatitude, 100);
        }).toThrow("Southern hemisphere not yet served by application logic");
        expect(() => {
            eastWestChangeInKMToLongitudeDegrees(0, 1, outOfBoundsLongitude2);
        }).toThrow("Longitude out of bounds");
        expect(() => {
            eastWestChangeInKMToLongitudeDegrees(0, 1, outOfBoundsLongitude);
        }).toThrow("Longitude out of bounds");
        expect(() => {
            eastWestChangeInKMToLongitudeDegrees(10, tooCloseToNorthPole1, 15);
        }).toThrow("We don't bother doing math at the North Pole");
        expect(() => {
            eastWestChangeInKMToLongitudeDegrees(500, tooCloseToNorthPole2, 55);
        }).toThrow("We don't bother doing math at the North Pole");
        expect(() => {
            eastWestChangeInKMToLongitudeDegrees(-55, tooCloseToNorthPole3, -100);
        }).toThrow("We don't bother doing math at the North Pole");
    });
});
