import { client, castRow } from "./client";
import type { User } from "./types";

export const usersDb = {
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: User["role"];
  }) {
    const result = await client.execute({
      sql: `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      args: [data.name, data.email, data.password, data.role],
    });
    return Number(result.lastInsertRowid);
  },

  async updateUser(id: number, data: Partial<User>) {
    const updates = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => `${key} = ?`)
      .join(", ");

    const values = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([_, value]) => value);

    if (updates.length > 0) {
      await client.execute({
        sql: `UPDATE Users SET ${updates} WHERE id = ?`,
        args: [...values, id],
      });
    }
  },

  async getUser(id: number) {
    const result = await client.execute({
      sql: "SELECT * FROM Users WHERE id = ?",
      args: [id],
    });
    return castRow<User>(result.rows[0]);
  },

  async getUserByEmail(email: string) {
    const result = await client.execute({
      sql: "SELECT * FROM Users WHERE email = ?",
      args: [email],
    });
    return castRow<User>(result.rows[0]);
  },
};
