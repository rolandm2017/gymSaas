// from the origin, create a grid extending N km in any given direction.
// it could be a grid, it could be a sphere. But it will have sharp edges.

function generateGrid(startLong, startLat, jump, radius) {
    /*
     * jump - the space between the focal point ("center") of any two grid positions
     * radius - how far from the origin we want to go.
     */
}

function getNextRing(focalPoint, jump, ringDistance) {
    // from the focal point, calculate distance to sides.
    // then divide the sides into Y subsections.
    /*
     * focalPoint - where the grid is centered.
     * ringDistance - distance from focalPoint to the nearest point on the perimeter of the ring (which is a square)
     */

    const leftSideX = focalPoint.x - ringDistance;
    const rightSideX = focalPoint.x + ringDistance;
    const leftSideY = focalPoint.y; // same height as the focal point.
    const rightSideY = focalPoint.y;

    const topLeftCorner = { x: leftSideX, y: leftSideY + ringDistance };
    const topRightCorner = { x: rightSideX, y: rightSideY + ringDistance };
    const bottomLeftCorner = { x: leftSideX, y: leftSideY - ringDistance };
    const bottomRightCorner = { x: rightSideX, y: rightSideY - ringDistance };

    // because the distance from the center to the nearest point on the perimeter * 2 = a full side
    const sideLength = ringDistance * 2;
    const subdivisions = sideLength / jump; // note: expecting integer values

    // todo: fill me in
}

function generateSimpleGrid(sLong, sLat, radius, jump) {
    // get left hand side from coords + radius left;
    // get right hand side from ... you get the picture
    // at some point convert from long/lat to km and back
    /*
     * startingLong & Lat - center of the grid
     * radius - in km
     * jump - distance between centers of the grid (in degrees)
     */
    const radiusAsDegreesLong = convertKMChangeToDegeesLong(radius, sLat, sLong);
    const radiusAsDegreesLat = convertKMChangeToDegeesLat(radius);
    const furthestPointNorth = sLat + radiusAsDegreesLat;
    const furthestPointSouth = sLat - radiusAsDegreesLat;
    const furthestPointEast = sLong + radiusAsDegreesLong;
    const furthestPointWest = sLong - radiusAsDegreesLong;

    const subdivisionCoords = [];
    for (let y = furthestPointNorth; y < furthestPointSouth; y -= jump) {
        for (let x = furthestPointWest; x < furthestPointEast; x += jump) {
            const point = { x, y };
            subdivisionCoords.push(point);
        }
    }
    return subdivisionCoords;
}
