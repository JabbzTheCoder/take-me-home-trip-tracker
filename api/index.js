import app, { initializeDatabase } from '../server/index.js';

export default async function handler(req, res) {
  await initializeDatabase();
  return app(req, res);
}
