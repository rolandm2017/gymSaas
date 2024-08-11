# The Apartments Near Gyms Backend

This is the majority of the backend for the Apartments Near Gyms software program. The other portion is the web scraper, linked below.

Apartments Near Gyms is a program that helps weightlifters find an apartment with a gym in a convenient location.

The program scrapes apartment data from Canadian rental sites and uses gym data from Google's Places API. The program checks each scraped apartment for proximity to a gym, and keeps the apartment in the database if a gym is less than a five minute walk from the apartment.

The backend handles user authentication, the control of scraping tasks for the scraper, and acquisition of gym data. It uses a controller, service, and data access layer to keep the program organized.

You can view the web scraper portion of the program here: https://github.com/rolandm2017/apScraper

And the client side code here: https://github.com/rolandm2017/gymsFE

Happy reading!
