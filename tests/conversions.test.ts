import { latitudeAtEquator, maxDegreesLatitude } from "../src/util/constants";
import {
    convertKMChangeToLatLong,
    convertProgressTowardsNorthPoleAsPercentage,
    changeInNorthSouthKMToLatitudeDegrees,
    changeInEastWestKMToLongitudeDegrees,
    getDistanceFromLatLongInKm,
} from "../src/util/conversions";

// **
// Testing conversions from lat,long => km and vice versa
// **

// todo: kmChangeToLatlong
const outOfBoundsLatitude = 91;
const southernHemisphereLatitude = -1;
const outOfBoundsLongitude = 181;
const outOfBoundsLongitude2 = -181;

// latitudes to test at
const oneFourthUpSphere = 0.25 * 90;
const halfwayUpSphere = 0.5 * 90;
const oneThirdUpSphere = (1 / 3) * 90;

describe("convert KM change to lat,long", () => {
    test("travelling North/South yields expected values", () => {
        expect(convertKMChangeToLatLong(111, 0, 10, 1)).toEqual({ lat: 11, long: 1 });
        expect(convertKMChangeToLatLong(222, 0, 10, 1)).toEqual({ lat: 12, long: 1 });
        expect(convertKMChangeToLatLong(-111, 0, 10, 1)).toEqual({ lat: 9, long: 1 });
        expect(convertKMChangeToLatLong(-222, 0, 10, 1)).toEqual({ lat: 8, long: 1 });
    });

    test("Travelling east/west yields expected values", () => {
        expect(convertKMChangeToLatLong(0, 111.321, latitudeAtEquator, 0)).toEqual({ lat: latitudeAtEquator, long: 1 });
        expect(convertKMChangeToLatLong(0, 222.642, latitudeAtEquator, 50)).toEqual({ lat: latitudeAtEquator, long: 52 });
        // Note: TBH I actually have no idea if many of the following values' outputs are working correctly.
        // I would need math to verify. These answers *look* sensible, however.
        expect(convertKMChangeToLatLong(0, 111.321, oneFourthUpSphere, 0)).toEqual({ lat: oneFourthUpSphere, long: 1.3333333333333335 });
        expect(convertKMChangeToLatLong(0, 111.321, oneFourthUpSphere, 120)).toEqual({ lat: oneFourthUpSphere, long: 121.3333333333333335 });
        expect(convertKMChangeToLatLong(0, -111.321, oneFourthUpSphere, 120)).toEqual({ lat: oneFourthUpSphere, long: 120 - 1.3333333333333335 });
        expect(convertKMChangeToLatLong(0, 111.321, oneThirdUpSphere, 0)).toEqual({ lat: oneThirdUpSphere, long: 1.4999999999999998 });
        expect(convertKMChangeToLatLong(0, 111.321, oneThirdUpSphere, -100)).toEqual({ lat: oneThirdUpSphere, long: -100 + 1.4999999999999998 });
        expect(convertKMChangeToLatLong(0, -111.321, oneThirdUpSphere, -100)).toEqual({ lat: oneThirdUpSphere, long: -100 - 1.4999999999999998 });
        expect(convertKMChangeToLatLong(0, 111.321, halfwayUpSphere, 0)).toEqual({ lat: halfwayUpSphere, long: 2 });
        expect(convertKMChangeToLatLong(0, 111.321, halfwayUpSphere, -30)).toEqual({ lat: halfwayUpSphere, long: -28 });
        expect(convertKMChangeToLatLong(0, -111.321, halfwayUpSphere, -30)).toEqual({ lat: halfwayUpSphere, long: -32 });
    });
    test("No change yields no change", () => {
        expect(convertKMChangeToLatLong(0, 0, latitudeAtEquator, 0)).toEqual({ lat: latitudeAtEquator, long: 0 });
        expect(convertKMChangeToLatLong(0, 0, oneFourthUpSphere, 100)).toEqual({ lat: oneFourthUpSphere, long: 100 });
        expect(convertKMChangeToLatLong(0, 0, halfwayUpSphere, -30)).toEqual({ lat: halfwayUpSphere, long: -30 });
        expect(convertKMChangeToLatLong(0, 0, oneThirdUpSphere, -60)).toEqual({ lat: oneThirdUpSphere, long: -60 });
    });
});

describe("return the progress towards the North Pole as a percentage", () => {
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
        expect(changeInNorthSouthKMToLatitudeDegrees(111, 50)).toBe(oneKM);
        expect(changeInNorthSouthKMToLatitudeDegrees(111, 80)).toBe(oneKM);
        expect(changeInNorthSouthKMToLatitudeDegrees(111, 10)).toBe(oneKM);
        expect(changeInNorthSouthKMToLatitudeDegrees(-111, 50)).toBe(oneKMSouth);
        expect(changeInNorthSouthKMToLatitudeDegrees(-111, 80)).toBe(oneKMSouth);
        expect(changeInNorthSouthKMToLatitudeDegrees(-111, 10)).toBe(oneKMSouth);
    });
});

describe("Accurately convert travelling east/west in km to longitude", () => {
    const startLong1 = 100;
    const startLong2 = 150;
    const startLong3 = 10;

    const oneKM = 1;

    const tooCloseToNorthPole1 = 89.93;
    const tooCloseToNorthPole2 = 81;
    const tooCloseToNorthPole3 = 85;
    test("At the Equator, 111.321 km east is 1 deg longitude", () => {
        expect(changeInEastWestKMToLongitudeDegrees(111.321, 0, startLong1)).toBe(oneKM);
        expect(changeInEastWestKMToLongitudeDegrees(111.321, 0, startLong2)).toBe(oneKM);
        expect(changeInEastWestKMToLongitudeDegrees(111.321, 0, startLong3)).toBe(oneKM);
    });
    test("An input of 0 distance travelled yields 0", () => {
        expect(changeInEastWestKMToLongitudeDegrees(0, 90, startLong1)).toBe(0);
        expect(changeInEastWestKMToLongitudeDegrees(0, 90, startLong2)).toBe(0);
        expect(changeInEastWestKMToLongitudeDegrees(0, 90, startLong3)).toBe(0);
    });
    test("At various latitudes, a movement east/west converts to appropriate longitude", () => {});

    test("Throws errors for non-supported values", () => {
        expect(() => {
            console.log(outOfBoundsLatitude, "67rm");
            changeInEastWestKMToLongitudeDegrees(1, outOfBoundsLatitude, 100);
        }).toThrow("Latitude out bounds");
        expect(() => {
            changeInEastWestKMToLongitudeDegrees(1, southernHemisphereLatitude, 100);
        }).toThrow("Southern hemisphere not yet served by application logic");
        expect(() => {
            changeInEastWestKMToLongitudeDegrees(1, 1, outOfBoundsLongitude2);
        }).toThrow("Longitude out of bounds");
        expect(() => {
            changeInEastWestKMToLongitudeDegrees(1, 1, outOfBoundsLongitude);
        }).toThrow("Longitude out of bounds");
        expect(() => {
            changeInEastWestKMToLongitudeDegrees(10, tooCloseToNorthPole1, 15);
        }).toThrow("We don't bother doing math at the North Pole");
        expect(() => {
            changeInEastWestKMToLongitudeDegrees(500, tooCloseToNorthPole2, 55);
        }).toThrow("We don't bother doing math at the North Pole");
        expect(() => {
            changeInEastWestKMToLongitudeDegrees(-55, tooCloseToNorthPole3, -100);
        }).toThrow("We don't bother doing math at the North Pole");
    });
});

describe("Changes in lat,long yield the correct KM change", () => {
    // Again I am more like documenting than testing here:
    // I don't actually have the math skills to figure out if these answers are "good enough"
    // or downright wrong. It *looks* approximately right to me.
    test("Travelling only east/west", () => {
        expect(getDistanceFromLatLongInKm(latitudeAtEquator, 0, latitudeAtEquator, 1)).toBe(111.19492664455873);
        expect(getDistanceFromLatLongInKm(latitudeAtEquator, 1, latitudeAtEquator, 2)).toBe(111.19492664455873);
        expect(getDistanceFromLatLongInKm(oneFourthUpSphere, 0, oneFourthUpSphere, 1)).toBe(102.73052588961731);
        expect(getDistanceFromLatLongInKm(oneThirdUpSphere, 0, oneThirdUpSphere, 1)).toBe(96.29732567761188);
        expect(getDistanceFromLatLongInKm(halfwayUpSphere, 0, halfwayUpSphere, 1)).toBe(78.62618767687454);
    });
    test("Travelling only north/south", () => {
        // still just documenting the stackOverflow code
        expect(getDistanceFromLatLongInKm(0, 1, 1, 1)).toBe(111.19492664455873);
        expect(getDistanceFromLatLongInKm(10, 1, 20, 1)).toBe(1111.9492664455872);
    });
    test("Travelling nowhere", () => {
        expect(getDistanceFromLatLongInKm(0, 0, 0, 0)).toBe(0);
        expect(getDistanceFromLatLongInKm(10, 10, 10, 10)).toBe(0);
    });
});
