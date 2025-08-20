import { client, castRow, castRows } from "./client";
import type { Invigilator } from "./types";

export const invigilatorsDb = {
  async getInvigilator(id: number) {
    const result = await client.execute({
      sql: "SELECT * FROM Invigilators WHERE id = ?",
      args: [id],
    });
    return castRow<Invigilator>(result.rows[0]);
  },

  async getInvigilatorByUserId(userId: number) {
    const result = await client.execute({
      sql: "SELECT * FROM Invigilators WHERE user_id = ?",
      args: [userId],
    });
    return castRow<Invigilator>(result.rows[0]);
  },

  async getInvigilatorsBySession(sessionId: number) {
    const result = await client.execute({
      sql: `
        SELECT DISTINCT i.*, u.name, u.email
        FROM Invigilators i
        JOIN SessionInvigilators si ON i.id = si.invigilator_id
        JOIN SessionDivisions sd ON si.session_division_id = sd.id
        JOIN Users u ON i.user_id = u.id
        WHERE sd.session_id = ?
      `,
      args: [sessionId],
    });
    return castRows<Invigilator & {name: string; email: string}>(result.rows).map(invigilator => ({
      ...invigilator,
      user: {
        id: invigilator.user_id,
        name: invigilator.name,
        email: invigilator.email,
        role: "invigilator" as const,
        password: ""
      }
    }));
  },

  async createInvigilator(data: Omit<Invigilator, "id">) {
    const result = await client.execute({
      sql: `INSERT INTO Invigilators (user_id, department) 
            VALUES (?, ?)`,
      args: [
        Number(data.user_id),
        data.department || null
      ],
    });
    return Number(result.lastInsertRowid);
  },

  async updateInvigilator(id: number, data: Partial<Invigilator>) {
    const updates = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => `${key} = ?`)
      .join(", ");

    const values = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([_, value]) => value);

    if (updates.length > 0) {
      await client.execute({
        sql: `UPDATE Invigilators SET ${updates} WHERE id = ?`,
        args: [...values, id],
      });
    }
  },

  async getAllInvigilators() {
    const result = await client.execute({
      sql: `
        SELECT i.*, u.name, u.email 
        FROM Invigilators i 
        JOIN Users u ON i.user_id = u.id 
        ORDER BY u.name
      `,
    });
    return castRows<Invigilator & {name: string; email: string}>(result.rows).map(invigilator => ({
      ...invigilator,
      user: {
        id: invigilator.user_id,
        name: invigilator.name,
        email: invigilator.email,
        role: "invigilator" as const,
        password: ""
      }
    }));
  },

  async deleteInvigilator(id: number) {
    await client.execute({
      sql: "DELETE FROM Invigilators WHERE id = ?",
      args: [id],
    });
  },
};
