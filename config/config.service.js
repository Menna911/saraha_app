import dotenv from "dotenv";

dotenv.config({ path: "./config/.env.development" });

export const DB_URI = process.env.DB_URI;
export const NODE_ENV = process.env.NODE_ENV;
export const port = process.env.PORT || 3000;


export const IV_LENGTH = parseInt(process.env.IV_LENGTH ??'16')

export const ENC_SECRET_KEY =Buffer.from(process.env.ENC_SECRET_KEY)