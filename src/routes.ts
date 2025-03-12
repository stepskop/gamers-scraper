import { createPlaywrightRouter, Dataset } from 'crawlee';
import { Platform, GameDeal, RouteLabel } from './types.js';

/* Transform scraped date of end to normalized Date
    - Steam is providing the end date as "SALE ends 13 March" or "SALE ends in 1:34:24"
    - Epic Games provides that data as "3/13/2025"
*/
const normalizeDate = (rawDate: string | null, platform: Platform): Date | undefined => {
    if (!rawDate) {
        return undefined;
    }
    switch (platform) {
        case Platform.STEAM: {
            const dateNow = new Date();

            // If date starts with in - offer ends today
            if (rawDate.startsWith('in')) return dateNow;

            const [dayNum, monthName] = rawDate.split(' ');
            const scheduledOn = new Date(`${dayNum} ${monthName} ${dateNow.getFullYear()}`);
            return scheduledOn;
        }
        case Platform.EPIC: {
            return new Date(rawDate);
        }
        default: {
            return undefined;
        }
    }
};

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ enqueueLinks }) => {
    // Handle links based on their site-specific selectors
    await enqueueLinks({
        globs: ['https://store.epicgames.com/**'],
        selector: 'div[data-component="FreeOfferCard"] > a[aria-label]:has-text("Free now")',
        label: RouteLabel.EPIC_GAMES,
    });
    await enqueueLinks({
        globs: ['https://store.steampowered.com/**'],
        selector: 'a.search_result_row',
        label: RouteLabel.STEAM,
    });
});

router.addHandler(RouteLabel.EPIC_GAMES, async ({ page, log, request }) => {
    await page.waitForLoadState('domcontentloaded');

    // Detect if there is age verification and solve it
    const ageCheck = await page.locator('span', { hasText: 'may contain content not suitable for all ages.' }).isVisible();
    if (ageCheck) {
        await page.locator('#month_toggle').click();
        await page.locator('#month_menu > li').nth(1).click();

        await page.locator('#day_toggle').click();
        await page.locator('#day_menu > li').nth(1).click();

        await page.locator('#year_toggle').click();
        await page.locator('#year_menu > li').nth(19).click(); // On Epic Games they have years sorted from today to previous

        await page.locator('#btn_age_continue').click();
    }

    const asideSection = page.locator('aside'); // element wrapping all game details on Epic Games

    // Scrape all targeted fields - very specific per platform and its current version
    const data: GameDeal = {
        name: await page.locator('h1').innerText(),
        url: request.loadedUrl,
        endDate: normalizeDate((await asideSection
            .locator('span > span:has-text("Sale ends")').textContent())?.split(' ')[2] ?? null, Platform.EPIC), // See more in "normalizeDate()" comment
        originalPrice: await asideSection
            .locator('span:has-text("-100%")').locator('xpath=../../../..')
            .locator('div > div:has-text("Free") > div', { hasNotText: 'Free' }).textContent(),
        publisher: await asideSection.locator('span:has-text("Publisher")').locator('xpath=..').locator('div').textContent(),
        developer: await asideSection.locator('span:has-text("Developer")').locator('xpath=..').locator('div').textContent(),
        thumbnail: await page.locator('ul[data-testid="carousel-slider"] > li img').first().getAttribute('src'),
        platform: Platform.EPIC,
    };
    log.info(`Found ongoing game deal on [${data.platform.toUpperCase()}]: ${JSON.stringify(data)}`);
    await Dataset.pushData(data);
});

router.addHandler(RouteLabel.STEAM, async ({ page, log, request }) => {
    await page.waitForLoadState('domcontentloaded');

    // Detect if there is age verification and solve it
    const ageCheck = await page.locator('h2', { hasText: 'This game may contain content not appropriate for all ages,' }).isVisible();
    if (ageCheck) {
        await page.locator('#ageYear').selectOption({ index: 0 }); // On Steam they have years sorted from previous to today
        await page.locator('#view_product_page_btn').click();
    }

    // Scrape all targeted fields - very specific per platform and its current version
    const data: GameDeal = {
        name: await page.locator('#appHubAppName').textContent(),
        url: request.loadedUrl,
        endDate: normalizeDate((await page
            .locator('p.game_purchase_discount_countdown')
            .first()
            .textContent())?.split('ends ')[1] ?? null, Platform.STEAM), // See more in "normalizeDate()" comment
        originalPrice: await page.locator('div.discount_original_price').first().textContent(),
        publisher: await page.locator('#game_highlights div.dev_row', { hasText: 'Publisher' }).getByRole('link').first().textContent(),
        developer: await page.locator('#game_highlights div.dev_row', { hasText: 'Developer' }).locator('#developers_list').getByRole('link').first()
            .textContent(),
        thumbnail: await page.locator('img.game_header_image_full').getAttribute('src'),
        platform: Platform.STEAM,
    };
    log.info(`Found ongoing game deal on [${data.platform.toUpperCase()}]: ${JSON.stringify(data)}`);
    await Dataset.pushData(data);
});
