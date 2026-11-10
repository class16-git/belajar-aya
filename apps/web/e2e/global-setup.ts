import { db, resetDb } from './helpers';

export default async function globalSetup() {
  await resetDb();
  await db.$disconnect();
}
