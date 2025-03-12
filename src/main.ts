import { Actor, ProxyConfigurationOptions } from 'apify';
import { BrowserName, DeviceCategory, OperatingSystemsName, PlaywrightCrawler } from 'crawlee';
import { router } from './routes.js';

interface Input {
    maxRequestsPerCrawl: number,
    maxRequestRetries: number,
    proxyConfigurationOptions: ProxyConfigurationOptions
}

// Initialize the Apify SDK
await Actor.init();

// Structure of input is defined in input_schema.json
const {
    maxRequestsPerCrawl = 10,
    maxRequestRetries = 10,
    proxyConfigurationOptions,
} = await Actor.getInput<Input>() ?? {} as Input;

const proxyConfiguration = await Actor.createProxyConfiguration(proxyConfigurationOptions);
const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    maxRequestRetries,
    requestHandler: router,
    launchContext: {
        launchOptions: {
            headless: true,
            args: [
                '--disable-gpu', // Mitigates the "crashing GPU process" issue in Docker containers
            ],
        },
    },
    browserPoolOptions: {
        useFingerprints: true, // this is the default
        fingerprintOptions: {
            fingerprintGeneratorOptions: {
                browsers: [
                    {
                        name: BrowserName.edge,
                        minVersion: 96,
                    },
                    {
                        name: BrowserName.firefox,
                        minVersion: 135,
                    },
                    {
                        name: BrowserName.chrome,
                        minVersion: 132,
                    },
                ],
                devices: [DeviceCategory.desktop],
                operatingSystems: [OperatingSystemsName.windows, OperatingSystemsName.linux],
            },
        },
    },
    statisticsOptions: {
        saveErrorSnapshots: true,
    },
});

await crawler.run([
    'https://store.epicgames.com/en-US/free-games', // For Epic Games, we start at dedicated /free-games page
    'https://store.steampowered.com/search/?maxprice=free&category1=998&specials=1', // For Steam, we start at store page with filters provided in URL
]);

// Exit successfully
await Actor.exit();
