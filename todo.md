1. go through the process of a) get gym from google api => b) store gym in db => c) get gym from db etc and make sure it puts the street addr into the db, takes it out, and gym.model + IGym has both the same property for street. Currently "street address" is stored under "street" in gym.model. Thats wrong. It should be "streetAddress" or "formattedAddress" like in the Google Places API

2. set up scraping apartments using flask

3. ap scraping must put aps in a database.

4. aps that are older than 4 weeks must be deleted.

5. use the grid searching code intended for apartment scraping to plot points on a map. that way you can see if its moving a good amount east/west etc when re-targeting the provider's maps.

6. add user auth

7. add "buy credits using stripe"

8. add system that uses a credit for each apartment loaded.

9. figure out pricing model
