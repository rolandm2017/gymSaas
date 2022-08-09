## Lat long info

// ==
// Latitude:
// is parallel to the equator.
// The distance covered by a degree of latitude is always nigh the same: 69 miles +/- .5 miles or 111 km.
// Latitude goes from 0 at the equator to 90 deg at the North pole, and to -90 at the South pole.
// ==
// Longitude:
// is measured east-west from the Prime Meridian.
// The distance between degrees is 69.172 miles (111.321 km) at the equator, 0 at the poles.
// So going from 179 deg long to 180 deg long at 0 deg lat is 69.172 miles.
// And going from 179 long to 180 long at 89 deg lat is almost 0 miles.

### Useful Links

Read the slug
https://stackoverflow.com/questions/7202272/using-the-google-places-api-to-get-nearby-cities-for-a-given-place

Convert street address, city, etc., into lat/long
https://developers.google.com/maps/documentation/geocoding

Google Places API Docs
https://developers.google.com/maps/documentation/javascript/places

Lat & long info, incl min/max values, how to calculate km change for N degrees change of lat/long, etc
https://www.thoughtco.com/degree-of-latitude-and-longitude-distance-4070616

https://gis.stackexchange.com/questions/251643/approx-distance-between-any-2-longitudes-at-a-given-latitude

## Best Apartment Sources

1. RentCanada.com
2. RentSeeker.ca
3. RentFaster.ca

## How to scrape

1. RentCanada.com

Presumably these fields were discovered by inspecting the Networking tab of Chrome.

Use a URL query.

https://www.rentcanada.com/api/listings?page=1&listingsLedger=%7B%7D&filters=%7B%22amenities%22:%7B%22checklist%22:[]%7D,%22utilities%22:%7B%22checklist%22:[]%7D,%22petPolicies%22:%7B%22checklist%22:[]%7D,%22rentalTypes%22:%7B%22checklist%22:[]%7D,%22beds%22:%7B%22min%22:null,%22max%22:null,%22checklist%22:[]%7D,%22baths%22:%7B%22min%22:null,%22max%22:null,%22checklist%22:[]%7D,%22rates%22:%7B%22min%22:null,%22max%22:null%7D,%22sqft%22:%7B%22min%22:null,%22max%22:null%7D,%22mapBounds%22:%7B%22north%22:%7B%22lat%22:45.517364677766764,%22lng%22:-73.54265710766485%7D,%22south%22:%7B%22lat%22:45.49077609093645,%22lng%22:-73.57162496502569%7D%7D,%22keyword%22:null,%22furnished%22:null%7D

This query works.

Note "filters" is set to

%7B%22amenities%22:%7B%22checklist%22:[]%7D,%22utilities%22:%7B%22checklist%22:[]%7D,%22petPolicies%22:%7B%22checklist%22:[]%7D,%22rentalTypes%22:%7B%22checklist%22:[]%7D,%22beds%22:%7B%22min%22:null,%22max%22:null,%22checklist%22:[]%7D,%22baths%22:%7B%22min%22:null,%22max%22:null,%22checklist%22:[]%7D,%22rates%22:%7B%22min%22:null,%22max%22:null%7D,%22sqft%22:%7B%22min%22:null,%22max%22:null%7D,%22mapBounds%22:%7B%22north%22:%7B%22lat%22:45.517364677766764,%22lng%22:-73.54265710766485%7D,%22south%22:%7B%22lat%22:45.49077609093645,%22lng%22:-73.57162496502569%7D%7D,%22keyword%22:null,%22furnished%22:null%7D

There is a "lat" and "lng" value.

At the end of the response, it will tell you if there is a 2nd page. Under "pagination.nextPages".

To get page 2, set the query param key "page" to the value "2".

2. RentSeeker.ca

You need to set query params:

x-agolia-agent Algolia%20for%20JavaScript%20(3.33.0)%3B%20Browser

x-agolia-application-id 8HVK5I2WD9

x-agolia-api-key 68a749c1cd4aff1ca2c87a160617bd61

Presumably these fields were discovered by inspecting the Networking tab of Chrome.

hitsPerPage in the response JSON is 1,000. There is also a "nbPages" value and "page". Presumably you can feed a query param "page" = 2 and get page 2 if there are >1,000 hits.

3. RentFaster.ca

Send a raw string in the body. This one works:

"l=11%2C45.5017%2C-73.5673&area=45.71209802212626%2C-73.38568226318361%2C45.290512768533475%2C-73.74891773681642&exclude="

%2C is a URL entity code for , (a comma).

It looks like the query is saying, "level (l) = 11" or perhaps "location"

There are also long/lat in there. But who knows what its saying?

"l=11,45.5017,-73.5673&area=45.71209802212626,-73.38568226318361,45.290512768533475,-73.74891773681642&exclude="

The header also uses a Cookie:

PHPSESSID=2060b3eb3fe6ed290dcb19f3543741ec; \_gcl_au=1.1.1167754990.1656991721; \_ga=GA1.2.1983608871.1656991721; \_gid=GA1.2.926434949.1656991721; \_fbp=fb.1.1656991720812.932904256; \_ta=ca~1~9de8a34ae94473607d23d07f7008d925; lastcity=qc%2Fmontreal; \_gat_UA-226906-1=1; \_tac=false~google|not-available; \_tas=jwhs0t4osgq
