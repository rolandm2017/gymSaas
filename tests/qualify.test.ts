import { ProviderEnum } from "../src/enum/provider.enum";
import { IAssociation } from "../src/interface/Association.interface";
import { IGym } from "../src/interface/Gym.interface";
import { IHousing } from "../src/interface/Housing.interface";
import {
    qualify,
    sortWestToEast,
    binarySearch,
    isCloseEnough,
    lookAroundForQualifiedApartments,
    // pythagoras,
    // difference,
    // getDistanceBetween,
} from "../src/util/qualify";

// Note for reviewers: I am unsure about almost every test involving mathematics.

// NOTE: 1 deg lat is approx 111.321 km
// Therefore 0.001 deg lat is 0.111321 km
// So if "qualifyingDistance" is 1 km, a gym at 45.0011 lat and X long will associate an apartment at 45.001 lat and X long

// TODO: Break out the math. Find a real apartment, and a real gym,
// with lat/long for each, and calculate the distance between them by hand
// TODO: Do the above 3 times.

const ap1: IHousing = { type: "apartment", agreement: "rent", lat: 45.001, long: -73.0, source: ProviderEnum.rentCanada };
const ap2: IHousing = { type: "apartment", agreement: "rent", lat: 45.002, long: -73.0, source: ProviderEnum.rentCanada };
const ap3: IHousing = { type: "apartment", agreement: "rent", lat: 44.0, long: -73.0, source: ProviderEnum.rentCanada };
const ap4: IHousing = { type: "apartment", agreement: "rent", lat: 44.001, long: -73.0, source: ProviderEnum.rentCanada };
const ap5: IHousing = { type: "apartment", agreement: "rent", lat: 47.001, long: -73.0, source: ProviderEnum.rentCanada };

const gym1: IGym = {
    business_status: "OPERATIONAL",
    formatted_address: "",
    geometry: {
        location: {
            lat: 45.0011,
            lng: -73.0,
        },
    },
    icon: "",
    name: "",
    place_id: "",
    rating: 5,
    lat: 45.0011,
    long: -73.0,
};
const gym2: IGym = {
    business_status: "OPERATIONAL",
    formatted_address: "",
    geometry: {
        location: {
            lat: 44.0011,
            lng: -73.0,
        },
    },
    icon: "",
    name: "",
    place_id: "",
    rating: 5,
    lat: 45.00201,
    long: -73.0,
};

const apartments = [ap1, ap2, ap3, ap4, ap5];
const gyms = [gym1, gym2];

// describe("We qualify apartments and associate the winners with gyms", () => {
//     // FIXME: a simple version of this needs to run. Make "qualify" work well and who cares about the rest?
//     // test("qualify - happy paths", () => {
//     //     const MAX_QUALIFIED_DISTANCE = 1;
//     //     const gymWithAssociatedApartment = gym1;
//     //     const association: IAssociation = {
//     //         apartment: ap1,
//     //         distance: 0.0009000000000014552,
//     //     };
//     //     gymWithAssociatedApartment.associatedUnits = [association];
//     //     expect(qualify([ap1], [gym1], MAX_QUALIFIED_DISTANCE)).toMatchObject([gymWithAssociatedApartment]);
//     //     const gymWithAssociatedApartment2 = gym2;
//     //     const associations: IAssociation[] = [
//     //         {
//     //             apartment: ap1,
//     //             distance: 0.0009000000000014552,
//     //         },
//     //         { apartment: ap2, distance: 0.0010100000000008436 },
//     //     ];
//     //     gymWithAssociatedApartment2.associatedUnits = associations;

//     //     expect(qualify(apartments, gyms, MAX_QUALIFIED_DISTANCE)).toMatchObject([gymWithAssociatedApartment2]);
//     // });

//     test("qualify - edge cases", () => {
//         expect(qualify([], [], 1)).toEqual([]); // empty gyms and apartments
//         expect(() => {
//             qualify([], [], -5);
//         }).toThrow("Can't qualify with negative distance");
//     });
// });

// Zombie code as of Aug 12 2022 - think its replaced by code from "conversions.ts"

// describe("getDistanceBetween works as expected", () => {
//     test("Only positive values from math.abs", () => {
//         expect(difference(3, -5)).toEqual(8);
//         expect(difference(-8, -5)).toEqual(3);
//         expect(difference(-5, -8)).toEqual(3);
//         expect(difference(5, -5)).toEqual(10);
//     });

//     test("only positive integers", () => {
//         expect(() => {
//             pythagoras(-1, 1);
//         }).toThrow("Non-negative integers only");
//         expect(() => {
//             pythagoras(-0.0005, 1);
//         }).toThrow("Non-negative integers only");
//         expect(() => {
//             pythagoras(1, -0.01);
//         }).toThrow("Non-negative integers only");
//     });

//     test("verify math", () => {
//         expect(pythagoras(2, 2)).toEqual(2.8284271247461903);
//         expect(pythagoras(3, 3)).toEqual(4.242640687119285);
//         expect(pythagoras(5, 8)).toEqual(9.433981132056603);
//     });

//     test("two places with defined coords yield a distance", () => {
//         expect(getDistanceBetween(ap1, gym1)).toEqual(0.00010000000000331966); // TODO: Come back here in a month and
//         expect(getDistanceBetween(ap2, gym1)).toEqual(0.0009000000000014552); // see if this all looks correct still
//         expect(getDistanceBetween(ap3, gym2)).toEqual(1.0020099999999985); // because its difficult to say if its
//         expect(getDistanceBetween(ap4, gym2)).toEqual(1.0010100000000008); // right without viewing the results on a map.
//     });
// });
