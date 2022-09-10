import { IAssociation } from "./Association.interface";

export interface IGym {
    business_status: "OPERATIONAL" | any; // There are other statuses other than "Operational" but we dont know them yet
    formatted_address: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
        viewport?: {
            northeast?: {
                lat: number;
                lng: number;
            };
            southwest?: {
                lat: number;
                lng: number;
            };
        };
    };
    icon: string; // a url
    name: string; // business name
    // photos: not using this because I can't yet make sense of the data the API responds with
    // from docs: "A PlacePhoto can be used to obtain a photo with the getUrl() method" => ???
    // from docs, place_id is: "A textual identifier that uniquely identifies a place and
    // can be used to retrieve information about the place via a Place Details request."
    place_id: string;
    // plus_code: this is a replacement for a street address in places where a street address does not exist.
    // see https://developers.google.com/maps/documentation/javascript/places
    rating: number;
    types?: string[];
    user_ratings_total?: number;
    lat: number;
    long: number; // duplicate value? sure is!
    url?: string;
    associatedUnits?: IAssociation[];
}
