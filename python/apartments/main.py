import time
import requests
import re

s = requests.Session()
headers = {
   'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
}
r = s.get("https://www.apartments.com/surfside-fl/", headers=headers)
# print(r.text)

csrf = re.findall("aft: '.*'", r.text)
antiCrawl = re.findall("antiWebCrawlingToken: '.*'", r.text)
# print(csrf[-1][6:-1])
if antiCrawl:
    csrf = antiCrawl[-1][6:-1]
# print(r)

headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'origin': 'https://www.apartments.com',
    'referer': 'https://www.apartments.com/seattle-wa/?bb=5kzi-_xmzQ1l72h97B',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest',
    'x_csrf_token': csrf[-1][6:-1]
}

json_data = {
    'Map': {
        'BoundingBox': {
            'UpperLeft': {
                'Latitude': 48.00979493852227,
                'Longitude': -122.6680605593109,
            },
            'LowerRight': {
                'Latitude': 47.25185572090765,
                'Longitude': -122.05557276634215,
            },
        },
        'CountryCode': 'US',
        'Shape': None,
    },
    'Geography': {
        'ID': 'wyllkch',
        'Display': 'Seattle, WA',
        'GeographyType': 2,
        'Address': {
            'City': 'Seattle',
            'State': 'WA',
            'MarketName': 'Seattle',
            'DMA': 'Seattle-Tacoma, WA',
        },
        'Location': {
            'Latitude': 47.615,
            'Longitude': -122.336,
        },
        'BoundingBox': {
            'LowerRight': {
                'Latitude': 47.49555,
                'Longitude': -122.23591,
            },
            'UpperLeft': {
                'Latitude': 47.73414,
                'Longitude': -122.43623,
            },
        },
        'v': 17050,
    },
    'Listing': {},
    'Paging': {
        'Page': None,
    },
    'IsBoundedSearch': True,
    'ResultSeed': 101995,
    'Options': 0,
}
response = s.post('https://www.apartments.com/services/search/', headers=headers, json=json_data)
# print(response.text)
print(response.json())

cookies = {
    'lsc': '%7B%22Map%22%3A%7B%22BoundingBox%22%3A%7B%22LowerRight%22%3A%7B%22Latitude%22%3A47.49579%2C%22Longitude%22%3A-122.20849%7D%2C%22UpperLeft%22%3A%7B%22Latitude%22%3A47.74526%2C%22Longitude%22%3A-122.48109%7D%7D%7D%2C%22Geography%22%3A%7B%22ID%22%3A%22wyllkch%22%2C%22Display%22%3A%22Seattle%2C%20WA%22%2C%22GeographyType%22%3A2%2C%22Address%22%3A%7B%22City%22%3A%22Seattle%22%2C%22State%22%3A%22WA%22%2C%22MarketName%22%3A%22Seattle%22%2C%22DMA%22%3A%22Seattle-Tacoma%2C%20WA%22%7D%2C%22Location%22%3A%7B%22Latitude%22%3A47.615%2C%22Longitude%22%3A-122.336%7D%2C%22BoundingBox%22%3A%7B%22LowerRight%22%3A%7B%22Latitude%22%3A47.49555%2C%22Longitude%22%3A-122.23591%7D%2C%22UpperLeft%22%3A%7B%22Latitude%22%3A47.73414%2C%22Longitude%22%3A-122.43623%7D%7D%2C%22v%22%3A17050%7D%2C%22Listing%22%3A%7B%7D%2C%22Paging%22%3A%7B%7D%2C%22IsBoundedSearch%22%3Atrue%2C%22ResultSeed%22%3A119676%2C%22Options%22%3A0%7D',
}

# headers = {
#     'accept': 'application/json, text/javascript, */*; q=0.01',
#     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
#     'x-requested-with': 'XMLHttpRequest',
#     'x_csrf_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE2NTU5NDMzNzYsImV4cCI6MTY1NjAyOTc3NiwiaWF0IjoxNjU1OTQzMzc2LCJpc3MiOiJodHRwczovL3d3dy5hcGFydG1lbnRzLmNvbSIsImF1ZCI6Imh0dHBzOi8vd3d3LmFwYXJ0bWVudHMuY29tIn0.Not2Kcc1vQXnViG1xNNO5bpY4ighAYj7wMhMhCurop4',
# }

# json_data = {
#     'ListingKeys': [
#         'wlgdcmj',
#     ],
#     'SearchCriteria': {
#         'Map': {
#             'BoundingBox': {
#                 'LowerRight': {
#                     'Latitude': 47.49579,
#                     'Longitude': -122.20849,
#                 },
#                 'UpperLeft': {
#                     'Latitude': 47.74526,
#                     'Longitude': -122.48109,
#                 },
#             },
#         },
#         'Geography': {
#             'ID': 'wyllkch',
#             'Display': 'Seattle, WA',
#             'GeographyType': 2,
#             'Address': {
#                 'City': 'Seattle',
#                 'State': 'WA',
#                 'MarketName': 'Seattle',
#                 'DMA': 'Seattle-Tacoma, WA',
#             },
#             'Location': {
#                 'Latitude': 47.615,
#                 'Longitude': -122.336,
#             },
#             'BoundingBox': {
#                 'LowerRight': {
#                     'Latitude': 47.49555,
#                     'Longitude': -122.23591,
#                 },
#                 'UpperLeft': {
#                     'Latitude': 47.73414,
#                     'Longitude': -122.43623,
#                 },
#             },
#             'v': 17050,
#         },
#         'Listing': {},
#         'Paging': {},
#         'IsBoundedSearch': True,
#         'ResultSeed': 101995,
#         'Options': 0,
#     },
# }

# response = s.post('https://www.apartments.com/services/property/infoCardData', cookies=cookies, headers=headers, json=json_data)
# print(response.text)
