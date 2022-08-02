import {
    convertKMChangeToLatLong,
    convertProgressTowardsNorthPoleAsPercentage,
    northSouthChangeInKMToLatitudeDegrees,
    eastWestChangeInKMToLongitudeDegrees,
} from "../src/util/conversions";

// todo: kmChangeToLatlong

describe("Testing conversions from lat,long => km and vice versa", () => {
    test("two number inputs should yield a number between 0 and 1", () => {
        expect(convertProgressTowardsNorthPoleAsPercentage(1)).toBe(1 / 90);
        expect(convertProgressTowardsNorthPoleAsPercentage(89)).toBe(89 / 90);
    });
    test("should throw for invalid values", () => {
        expect(() => {
            convertProgressTowardsNorthPoleAsPercentage(-1);
        }).toThrow("Southern hemisphere not yet served by application logic");
        expect(() => {
            convertProgressTowardsNorthPoleAsPercentage(91);
        }).toThrow("Latitude out bounds");
    });
});

describe("Accurately convert travelling north/south in km to latitude", () => {
    test("Regardless of position, one degree north or south is 111 km", () => {
        expect(northSouthChangeInKMToLatitudeDegrees(111, 10)).toBe(1);
        expect(northSouthChangeInKMToLatitudeDegrees(111, 50)).toBe(1);
        expect(northSouthChangeInKMToLatitudeDegrees(111, 80)).toBe(1);
        expect(northSouthChangeInKMToLatitudeDegrees(-111, 10)).toBe(-1);
        expect(northSouthChangeInKMToLatitudeDegrees(-111, 50)).toBe(-1);
        expect(northSouthChangeInKMToLatitudeDegrees(-111, 80)).toBe(-1);
    });
});

describe("Accurately convert travelling east/west in km to longitude", () => {
    const startLong1 = 100;
    const startLong2 = 150;
    const startLong3 = 10;
    test("At the Equator, 111.321 km east is 1 deg longitude", () => {
        expect(eastWestChangeInKMToLongitudeDegrees(111.321, 0, startLong1)).toBe(startLong1 + 1);
        expect(eastWestChangeInKMToLongitudeDegrees(111.321, 0, startLong2)).toBe(startLong2 + 1);
        expect(eastWestChangeInKMToLongitudeDegrees(111.321, 0, startLong3)).toBe(startLong3 + 1);
    });
    test("At the North Pole, 0 km east is 1 deg longitude", () => {
        expect(eastWestChangeInKMToLongitudeDegrees(0, 90, startLong1)).toBe(startLong1 + 1);
        expect(eastWestChangeInKMToLongitudeDegrees(0, 90, startLong2)).toBe(startLong2 + 1);
        expect(eastWestChangeInKMToLongitudeDegrees(0, 90, startLong3)).toBe(startLong3 + 1);
    });
    test("At various latitudes, a movement east/west converts to appropriate longitude", () => {});

    test("Throws errors for non-supported values", () => {
        expect(() => {
            eastWestChangeInKMToLongitudeDegrees(0, 91, 100);
        }).toThrow("Latitude out bounds");
        expect(() => {
            eastWestChangeInKMToLongitudeDegrees(0, -1, 100);
        }).toThrow("Southern hemisphere not yet served by application logic");
        expect(() => {
            eastWestChangeInKMToLongitudeDegrees(0, 1, -181);
        }).toThrow("Longitude out of bounds");
        expect(() => {
            eastWestChangeInKMToLongitudeDegrees(0, 1, 181);
        }).toThrow("Longitude out of bounds");
    });
});
