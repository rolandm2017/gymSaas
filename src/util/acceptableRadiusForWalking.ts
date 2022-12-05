import { ILatLong } from "../interface/LatLong.interface";
import { SEED_CITIES } from "../seed/seedCities";
import { convertKMChangeToLatLong } from "./conversions";

const MAX_WALK_TIME_IN_MINS = 4;

// average walking speed = 2.5 mph to 4 mph
// 2.5 mph to kmh = 4.02 km/h
// 4.02 km/h * 4 min / h = 0.268 km walked in 4 min
// hence we are now looking for 0.268 km traveled east-west at canadian latitudes,
// and 0.268 km traveled north-south at any longitude (because it is always the same!)

const MAX_KM_TRAVELED = 0.268;

const startingLat = SEED_CITIES[0].centerLat;
const startingLong = SEED_CITIES[0].centerLong;

const newDegLongitudeAfterMovement: ILatLong = convertKMChangeToLatLong(0, MAX_KM_TRAVELED, startingLat, startingLong);
const newDegLatitudeAfterMovement: ILatLong = convertKMChangeToLatLong(MAX_KM_TRAVELED, 0, startingLat, startingLong);

// max distance change in lat & long:
// lat: 0.002414414414417365
// long: 0.005321342746952951
const degChangeLatitude = newDegLatitudeAfterMovement.lat - startingLat;
const degChangeLongitude = newDegLongitudeAfterMovement.long - startingLong;

export const MAX_ACCEPTABLE_LATITUDE_DIFFERENCE = degChangeLatitude; //
export const MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE = degChangeLongitude; //

export const ACCEPTABLE_RADIUS_FOR_WALKING = 0;
