import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
export const pool =
  connectionString && connectionString.length > 0
    ? new Pool({ connectionString })
    : null;

export type User = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export type Ticket = {
  id: string;
  user_id: string;
  file_url: string;
  created_at: string;
  user_email?: string;
};
