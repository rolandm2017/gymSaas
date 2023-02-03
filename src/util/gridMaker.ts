// from the origin, create a grid extending N km in any given direction.
// it could be a grid, it could be a sphere. But it will have sharp edges.
import { convertKMChangeToLatLong } from "./conversions";
import { changeInEastWestKMToLongitudeDegrees, changeInNorthSouthKMToLatitudeDegrees } from "./conversions";

import { ILatLong } from "../interface/LatLong.interface";

export function generateGrid(startCoords: ILatLong, jump: number, radius: number): ILatLong[] {
    /*
     * jump - the space between the focal point ("center") of any two grid positions. "jump" is in KM.
     * radius - how far from the origin we want to go. a distance in ... km? degrees?
     */
    const ringDistances: number[] = [];
    let d = 0; // d for distance
    // Problem statement: A good "radius" might be 0.005 the way it is on 01/26.
    // But d < 0.005 runs 0 times.
    // Hence, we'll multiply the loop by ...
    // const mod = 4; // mod is a modification to stop the massive covers-canada size grids.
    const mod = 2; // mod is a modification to stop the massive covers-canada size grids.
    const jumpWithMod = jump / mod;
    const poorlyUnderstoodAdjustment = 10; // "poorlyUnderstood" because I have no idea what the loop is doing!
    for (let i = 0; d < radius; i++) {
        // d = (jump * i) / poorlyUnderstoodAdjustment;
        d = jumpWithMod * i;
        ringDistances.push(d);
    }
    const nodes: ILatLong[][] = ringDistances.map(ringDistance => getNextRing(startCoords, jumpWithMod, ringDistance));
    const flat = nodes.flat();
    flat.push(startCoords); // push because otherwise theyre missing from the scan!
    return flat;
}

function getNextRing(focalPoint: ILatLong, jump: number, ringDistanceInDegreesPreMod: number): ILatLong[] {
    // from the focal point, calculate distance to sides.
    // then divide the sides into Y subsections.
    /*
     * focalPoint - where the grid is centered.
     * ringDistance - distance from focalPoint to the nearest point on the perimeter of the ring (which is a square)
     * ** ringDistance is in degrees lat/long! you can tell because
     * ** minX is focalPoint.long - ringDistance, minY = .lat - ringDistance
     */
    const degreesLongitudeBetweenGrids = changeInEastWestKMToLongitudeDegrees(jump, focalPoint.lat, focalPoint.long);
    const degreesLatitudeBetweenGrids = changeInNorthSouthKMToLatitudeDegrees(jump, focalPoint.lat);

    // const modification = 15;
    const modification = 13;
    const ringDistance = ringDistanceInDegreesPreMod / modification;

    const minX = focalPoint.long - ringDistance;
    const maxX = focalPoint.long + ringDistance;
    const minY = focalPoint.lat - ringDistance;
    const maxY = focalPoint.lat + ringDistance;

    const magicMathAdjustment = 5;

    // because the distance from the center to the nearest point on the perimeter * 2 = a full side
    const sideLength = ringDistance * 2;
    const subdivisionsNorthSouth: number = sideLength / degreesLatitudeBetweenGrids / magicMathAdjustment; // note: expecting integer values
    const subdivisionsEastWest: number = sideLength / degreesLongitudeBetweenGrids / magicMathAdjustment;

    const topEdge = [];
    const bottomEdge = [];

    const rightEdge = [];
    const leftEdge = [];

    // form the left and right sides of the grid by fixing longitude, moving up and down by latitude
    for (let i = 0; i < subdivisionsNorthSouth; i++) {
        // const progressAlongEdge = (i * jump) / 2; // 2 added on 01/27 by guesstimation
        const progressAlongEdge = i * degreesLatitudeBetweenGrids * magicMathAdjustment;
        // topEdge.push({ long: minX + progressAlongEdge, lat: maxY });
        rightEdge.push({ long: maxX, lat: maxY - progressAlongEdge });
        // bottomEdge.push({ long: maxX - progressAlongEdge, lat: minY });
        leftEdge.push({ long: minX, lat: minY + progressAlongEdge });
    }
    // form the top and bottom of the grid by fixing latitude, moving west to east by lo
    for (let i = 0; i < subdivisionsEastWest; i++) {
        // const progressAlongEdge = (i * jump) / 2; // 2 added on 01/27 by guesstimation
        const progressAlongEdge = i * degreesLongitudeBetweenGrids * magicMathAdjustment;
        topEdge.push({ long: minX + progressAlongEdge, lat: maxY });
        // rightEdge.push({ long: maxX, lat: maxY - progressAlongEdge });
        bottomEdge.push({ long: maxX - progressAlongEdge, lat: minY });
        // leftEdge.push({ long: minX, lat: minY + progressAlongEdge });
    }

    const tasks = [topEdge, rightEdge, bottomEdge, leftEdge].flat();
    return tasks;
}
