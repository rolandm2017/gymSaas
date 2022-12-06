import { IAssociation } from "./Association.interface";

export interface IDemoGym {
    business_status: "OPERATIONAL" | any;
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
    place_id: string;
    rating: number;
    types?: string[];
    user_ratings_total?: number;
    lat: number;
    long: number; // duplicate value? sure is!
    url?: string;
    associatedUnits?: IAssociation[];
    cityId: number;
    cityName: string;
}
