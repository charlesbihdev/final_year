import { createClient } from "@libsql/client";
import type { Row } from "@libsql/client";

// Helper function to safely cast database rows to our types
export function castRow<T>(row: Row | undefined): T | undefined {
  if (!row) return undefined;
  return row as unknown as T;
}

export function castRows<T>(rows: Row[]): T[] {
  return rows as unknown as T[];
}

export const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "",
  authToken: process.env.TURSO_AUTH_TOKEN ?? "",
});
