import { getRequestContext } from "@cloudflare/next-on-pages";

export interface Env {
    DB: D1Database;
    PRODUCT_IMAGES: R2Bucket;
    RESEND_API_KEY: string;
}

export function getDB() {
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    if (!env.DB) {
        throw new Error("D1 Database binding 'DB' not found. Ensure you are running in a Cloudflare Workers environment or use 'wrangler pages dev'.");
    }
    return env.DB;
}

export function getR2() {
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    if (!env.PRODUCT_IMAGES) {
        throw new Error("R2 Bucket binding 'PRODUCT_IMAGES' not found.");
    }
    return env.PRODUCT_IMAGES;
}
