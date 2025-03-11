# Game Deals Scraper

This [actor](https://apify.com/actors) scrapes game offers with **100% discount** from popular online game stores, using [PlaywrightCrawler](https://crawlee.dev/docs/examples/playwright-crawler). Returning name, original price, pictrure, etc...<br>
Using this you won't miss any "juicy" offer like **Death Stranding** on 22 May 2023 or **GTA 5** on 14 May 2020. <br>You can use this as a automated source of data for any game newsletter or community channel.

> Just for [Epic Games](https://store.epicgames.com/en-US/) and [Steam](https://store.steampowered.com) for now, more coming in future..
>

## Input
| Property | Type | Required | Default value | Description |
| -------- | ---- | -------- | ------------- | ----------- |
| maxRequestsPerCrawl | number | No | 10 | Maximum numbers of requests per crawl |
| maxRequestsRetries | number | No | 10 | Maximum numbers of retries per request |
| proxyConfigurationOptions | object | No | | Proxy configiration passed to actor. For more see `ProxyConfiguationOptions` in [docs](https://docs.apify.com/sdk/js/reference/interface/ProxyConfigurationOptions) |

> Configuring the **proxy** is highly recommended to avoid blocking. See more in [docs](https://docs.apify.com/sdk/js/reference/interface/ProxyConfigurationOptions) or "Input" tab on **Apify Console**
>

## Example output
```json
{
    "name": "Them's Fightin' Herds",
    "url": "https://store.epicgames.com/en-US/p/thems-fightin-herds",
    "originalPrice": "$19.99",
    "endDate": "2025-03-13T00:00:00.000Z",
    "thumbnail": "https://cdn2.unrealengine.com/egs-themsfightinherds-mane6inc-s1-2560x1440-c2aa6090cc5c.jpg",
    "publisher": "Maximum Entertainment LLC",
    "developer": "Mane6",
    "platform": "epicgames"
}
```
## Errors
If there is error during scraping then current page screenshot is made and saved to [Key-Value store](https://docs.apify.com/platform/storage/key-value-store) with key formatted as `ERROR_[platform]_[random string]`, for example `ERROR_EPICGAMES_rk3j2sr`

<br>

# Internals
Actor development and tooling
### Used tools
If you're looking for examples or want to learn more visit:

- [Crawlee](https://crawlee.dev/) - crawler utilizing Playwright
- [Apify SDK](https://docs.apify.com/sdk/js/)

### Install dependencies
Installs all used packages
```bash
npm install
```

### Usage

For complete information [see this article](https://docs.apify.com/platform/actors/development#build-actor-locally), but TL;DR:

```bash
# Using apify-cli
apify run
```
or if you dont have [Apify CLI](https://docs.apify.com/cli/)
```bash
# Standalone
npm run start
```
*Examples above will run the actor locally in dev mode*

### Apify platform
Later you will be able to find and **run** this crawler directly on [Apify platform](https://apify.com/)