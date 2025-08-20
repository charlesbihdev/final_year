import { client, castRow, castRows } from "./client";
import type { FaceData } from "./types";

async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export const faceDataDb = {
  async getFaceData(id: number) {
    const result = await client.execute({
      sql: "SELECT * FROM FaceData WHERE id = ?",
      args: [id],
    });
    return castRow<FaceData>(result.rows[0]);
  },

  async getStudentFaceData(studentId: number) {
    const result = await client.execute({
      sql: "SELECT * FROM FaceData WHERE student_id = ?",
      args: [studentId],
    });
    return castRow<FaceData>(result.rows[0]);
  },

  async createFaceData(data: Omit<FaceData, "id">) {
    const embeddingBuffer = await blobToBuffer(data.embedding);
    const result = await client.execute({
      sql: "INSERT INTO FaceData (student_id, embedding) VALUES (?, ?)",
      args: [data.student_id, embeddingBuffer],
    });
    return Number(result.lastInsertRowid);
  },

  async updateFaceData(id: number, data: Partial<FaceData>) {
    if (!data.embedding) {
      // Only student_id can be updated without embedding
      if (data.student_id !== undefined) {
        await client.execute({
          sql: "UPDATE FaceData SET student_id = ? WHERE id = ?",
          args: [data.student_id, id],
        });
      }
    } else {
      const embeddingBuffer = await blobToBuffer(data.embedding);
      await client.execute({
        sql: `UPDATE FaceData SET embedding = ? WHERE id = ?`,
        args: [embeddingBuffer, id],
      });
    }
  },

  async deleteFaceData(id: number) {
    await client.execute({
      sql: "DELETE FROM FaceData WHERE id = ?",
      args: [id],
    });
  },
};
