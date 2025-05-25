// src/server.ts
import app from "./app";
import dotenv from 'dotenv';

dotenv.config(); // Ensure env vars are loaded

const PORT = process.env.PORT || 3000; // Or any port you prefer

app.listen(PORT, () => {
  console.log(`Zecretly Backend Server running on http://localhost:${PORT}`);
  // Here you could also connect to DB if not done on demand
  // and run migrations if needed using Drizzle Kit
});
