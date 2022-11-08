import HousingDAO from "../../src/database/dao/housing.dao";

const housingDAO = new HousingDAO();

describe("housingDAO tests", () => {
    test("we add 3 apartments to the db and then discover there are 3 in it", async () => {
        const ap1 = { buildingType: "apartment", agreementType: "rent", price: 100, address: "33 cats street", url: "google.ca", lat: 45, long: 45 };
        const ap2 = { buildingType: "apartment", agreementType: "rent", price: 100, address: "33 cats street", url: "google.ca", lat: 45, long: 45 };
        const ap3 = { buildingType: "apartment", agreementType: "rent", price: 100, address: "33 cats street", url: "google.ca", lat: 45, long: 45 };
        await housingDAO.createHousing(ap1);
        await housingDAO.createHousing(ap2);
        await housingDAO.createHousing(ap3);
        const all = await housingDAO.getMultipleHousings();
        expect(all.count).toEqual(3);
    });
});
