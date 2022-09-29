import { ILatLong } from "./LatLong.interface";

export interface IBounds {
    north: number; // latitude, longitude
    south: number;
    east: number;
    west: number;
    latitudeChange: number;
    longitudeChange: number;
    kmEastWest: number;
    kmNorthSouth: number;
}
