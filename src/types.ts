export enum Platform {
    EPIC = 'epicgames',
    STEAM = 'steam'
}

// Schema of final data
export interface GameDeal {
    name: string | null,
    url: string | null,
    originalPrice: string | null,
    endDate: Date | undefined,
    thumbnail: string | null,
    publisher: string | null,
    developer: string | null,
    platform: Platform
}
