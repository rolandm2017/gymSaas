import axios, { AxiosResponse } from "axios";

class GooglePlacesAPI {
    private apiKey;
    constructor() {
        this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    }

    public async getGymsByLatLong(lat: number, long: number, pageToken: string) {
        const baseURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
        const pageTokenSegment = `&pageToken=${pageToken}`;
        const key = `&key=${this.apiKey}`;
        const url = baseURL + `?location=${this.makeLocation(lat, long)}&radius=1500&type=gym` + pageTokenSegment + key;
        // actual req
        const response = await axios.get(url);
        const { data } = response;
        // useful bits
        const nextPageToken = data.next_page_token;
        const results = data.results;
        return { results, nextPageToken };
    }

    public embedLocation(country: string, province: string, city: string): string {
        const gym = "gym";
        return `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${city}+${province}+${country}&type=${gym}&key=${this.apiKey}`;
    }

    private makeLocation(long: number, lat: number) {
        return `${lat}%2C${long}`;
    }

    public async requestGyms(request: string, token?: string): Promise<AxiosResponse<any, any>> {
        const nextResponse = await axios.get(request, { params: { pagetoken: token } });
        return nextResponse;
    }
}

export default GooglePlacesAPI;
