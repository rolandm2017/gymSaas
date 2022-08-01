import scrapy
import time
import json
import re
import urllib

from apartments.items import ApartmentsItem

class SeattleSpider(scrapy.Spider):
    name = 'seattle'
    allowed_domains = ['apartments.com']

    # Change this url to search a different area
    start_urls = ['https://www.apartments.com/seattle-wa/?bb=t890-vglvQmi7yowF']

    def __init__(self):
        self.json_data = None

    def parse(self, response):
        scriptText = response.xpath('//script[contains(text(), "resultState")]').get()
        searchJson = re.findall('resultState: {.*},\r\n', scriptText)[-1]
        json_parse = searchJson[searchJson.find(' ')+1: -3]
        search = json.loads(json_parse)
        self.json_data = search['SearchCriteria']

        yield scrapy.Request('https://www.apartments.com/services/search/', method="POST", headers={'Content-Type':'application/json','accept': 'application/json'}, body=json.dumps(self.json_data), callback=self.parseList)

    def parseList(self, response):
        jsonresponse = json.loads(response.text)
        res = jsonresponse['PinsState']['cl']
        res = res.split('|')
        ids = []
        for x in range(len(res)):
            if x % 5 == 0:
                ids.append(res[x])

        for id in ids:
            if '~' in id:
                listing = id[2:]
            else:
                listing = id
            json_data = {
                'ListingKeys': [
                    listing
                ],
                'SearchCriteria': self.json_data
                ,
            }
            cookies = {
                'lsc': urllib.parse.quote(json.dumps(self.json_data))
            }
            time.sleep(.5)
            yield scrapy.Request('https://www.apartments.com/services/property/infoCardData', method="POST", headers={'Content-Type':'application/json','accept': 'application/json', 'x-requested-with': 'XMLHttpRequest'}, cookies=cookies, body=json.dumps(json_data), callback=self.parseItem)

    def parseItem(self, response):
        jsonresponse = json.loads(response.text)

        item = ApartmentsItem()
        item['title'] = jsonresponse['PropertyNameTitle']
        item['url'] = jsonresponse['PropertyUrl']
        item['latitude'] = jsonresponse['Listing']['Address']['Location']['Latitude']
        item['longitude'] = jsonresponse['Listing']['Address']['Location']['Longitude']

        yield item