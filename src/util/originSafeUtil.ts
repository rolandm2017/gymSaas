function isURLSafe(i: string): boolean {
    // ALPHA  DIGIT  "-" / "." / "_" / "~"
    // see https://stackoverflow.com/questions/695438/what-are-the-safe-characters-for-making-urls
    const legitCharRegex = /[A-Za-z0-9-._~]+$/;
    const isUrlSafe: boolean = legitCharRegex.test(i);
    return isUrlSafe;
}
