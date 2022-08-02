import { convertKMChangeToLatLong, convertProgressTowardsNorthPoleAsPercentage } from "../src/util/conversions";

describe("Testing conversions from lat,long => km and vice versa", () => {
    test("two number inputs should yield a number between 0 and 1", () => {
        expect(convertProgressTowardsNorthPoleAsPercentage(1)).toBe(1 / 90);
        expect(convertProgressTowardsNorthPoleAsPercentage(89)).toBe(89 / 90);
    });
    test("should throw for invalid values", () => {
        expect(() => {
            convertProgressTowardsNorthPoleAsPercentage(-1);
        }).toThrow("Degrees from equator must be between 0 and 90, inclusive");
        expect(() => {
            convertProgressTowardsNorthPoleAsPercentage(91);
        }).toThrow("Degrees from equator must be between 0 and 90, inclusive");
    });
});
