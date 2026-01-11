import { getRequestContext } from "@cloudflare/next-on-pages";

export interface Env {
    DB: D1Database;
}

export function getDB() {
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    if (!env.DB) {
        throw new Error("D1 Database binding 'DB' not found. Ensure you are running in a Cloudflare Workers environment or use 'wrangler pages dev'.");
    }
    return env.DB;
}
