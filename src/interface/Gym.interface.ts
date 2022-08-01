export interface Gym {
    business_status: "OPERATIONAL" | any; // There are other statuses other than "Operational" but we dont know them yet
    formatted_address: string;
    geometry: {
        location: {
            lat: number;
            long: number;
        };
        viewport: {
            northeast: {
                lat: number;
                long: number;
            };
            southwest: {
                lat: number;
                long: number;
            };
        };
    };
    icon: string; // a url
    name: string; // business name
    opening_hours: {
        open_now: boolean;
    };
    // photos: not using this because I can't yet make sense of the data the API responds with
    // from docs: "A PlacePhoto can be used to obtain a photo with the getUrl() method" => ???
    place_id: string;
    // plus_code: this is a replacement for a street address in places where a street address does not exist.
    // see https://developers.google.com/maps/documentation/javascript/places
    rating: number;
    types: string[];
    user_ratings_total: number;
}
