let housingId: number | undefined = undefined;

export function readNextHousingId() {
    if (housingId === undefined) return 0;
    return housingId;
}

export function incrementHousingId() {
    if (housingId === undefined) {
        housingId = 0;
    }
    housingId++;
}

export function setHousingIdFromDb(current: number) {
    housingId = current;
}
