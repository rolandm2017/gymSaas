import { Provider } from "../src/enum/provider.enum";
import { IAssociation } from "../src/interface/Association.interface";
import { IGym } from "../src/interface/Gym.interface";
import { IHousing } from "../src/interface/Housing.interface";
import { qualify, sortWestToEast, binarySearch, isCloseEnough, lookAroundForQualifiedApartments, pythagoras } from "../src/util/calculateDistance";

// NOTE: 1 deg lat is approx 111.321 km
// Therefore 0.001 deg lat is 0.111321 km
// So if "qualifyingDistance" is 1 km, a gym at 45.0011 lat and X long will associate an apartment at 45.001 lat and X long

// Q for reviewers:
// Tests for this file are difficult to write, would require
// breaking out mathematics to determine what answer a perfect test should give.
// What do I do? Trust my code? Break out a calculator and some trigonometry? Hire a mathematician?

const ap1: IHousing = { type: "apartment", agreement: "rent", lat: 45.001, long: -73.0, source: Provider.rentCanada };
const ap2: IHousing = { type: "apartment", agreement: "rent", lat: 45.002, long: -73.0, source: Provider.rentCanada };
const ap3: IHousing = { type: "apartment", agreement: "rent", lat: 44.0, long: -73.0, source: Provider.rentCanada };
const ap4: IHousing = { type: "apartment", agreement: "rent", lat: 44.001, long: -73.0, source: Provider.rentCanada };
const ap5: IHousing = { type: "apartment", agreement: "rent", lat: 47.001, long: -73.0, source: Provider.rentCanada };

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
    opening_hours: { open_now: true },
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
    opening_hours: { open_now: true },
    place_id: "",
    rating: 5,
    lat: 45.00201,
    long: -73.0,
};

const apartments = [ap1, ap2, ap3, ap4, ap5];
const gyms = [gym1, gym2];

describe("We qualify apartments and associate the winners with gyms", () => {
    // FIXME: a simple version of this needs to run
    // test("qualify - happy paths", () => {
    //     const MAX_QUALIFIED_DISTANCE = 1;
    //     const gymWithAssociatedApartment = gym1;
    //     const association: IAssociation = {
    //         apartment: ap1,
    //         distance: 0.0009000000000014552,
    //     };
    //     gymWithAssociatedApartment.associatedUnits = [association];
    //     expect(qualify([ap1], [gym1], MAX_QUALIFIED_DISTANCE)).toMatchObject([gymWithAssociatedApartment]);
    //     const gymWithAssociatedApartment2 = gym2;
    //     const associations: IAssociation[] = [
    //         {
    //             apartment: ap1,
    //             distance: 0.0009000000000014552,
    //         },
    //         { apartment: ap2, distance: 0.0010100000000008436 },
    //     ];
    //     gymWithAssociatedApartment2.associatedUnits = associations;

    //     expect(qualify(apartments, gyms, MAX_QUALIFIED_DISTANCE)).toMatchObject([gymWithAssociatedApartment2]);
    // });

    test("qualify - edge cases", () => {
        expect(qualify([], [], 1)).toEqual([]); // empty gyms and apartments
        expect(() => {
            qualify([], [], -5);
        }).toThrow("Can't qualify with negative distance");
    });
});

describe("pythagoras works as expected", () => {
    test("only positive integers", () => {
        expect(pythagoras(-1, 1)).toThrow("Positive integers only");
        expect(pythagoras(0, 1)).toThrow("Positive integers only");
        expect(pythagoras(1, -0.01)).toThrow("Positive integers only");
    });

    test("verify math", () => {
        expect(pythagoras(2, 2)).toEqual(2.8284271247461903);
        expect(pythagoras(3, 3)).toEqual(4.242640687119285);
        expect(pythagoras(5, 8)).toEqual(9.433981132056603);
    });
});
