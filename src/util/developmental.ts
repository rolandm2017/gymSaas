export function detectIncompletePageOfApartments(knownMax: number, currentResults: number): boolean {
    return currentResults < knownMax;
}

export function detectMaxResultsPerPage(results: any[]): number {
    return 0;
}
