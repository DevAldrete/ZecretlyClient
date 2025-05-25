import { seedDatabase, clearDatabase, generateSeedData, type SeedData } from '../../src/db/seed';

export class TestDatabase {
  private connectionString: string;
  private seedData: SeedData | null = null;

  constructor(connectionString?: string) {
    this.connectionString = connectionString || process.env.ZECRETLY_DB_CONNECTION_URI!;

    if (!this.connectionString) {
      throw new Error('Database connection string is required. Set ZECRETLY_DB_CONNECTION_URI environment variable.');
    }
  }

  /**
   * Seed the database with fresh test data
   */
  async seed(): Promise<SeedData> {
    await seedDatabase(this.connectionString);
    this.seedData = generateSeedData();
    return this.seedData;
  }

  /**
   * Clear all data from the database
   */
  async clear(): Promise<void> {
    await clearDatabase(this.connectionString);
    this.seedData = null;
  }

  /**
   * Reset the database (clear + seed)
   */
  async reset(): Promise<SeedData> {
    await this.clear();
    return await this.seed();
  }

  /**
   * Get the current seed data (must call seed() first)
   */
  getSeedData(): SeedData {
    if (!this.seedData) {
      throw new Error('No seed data available. Call seed() first.');
    }
    return this.seedData;
  }

  /**
   * Get a specific workspace by name
   */
  getWorkspace(name: string) {
    const seedData = this.getSeedData();
    return seedData.workspaces.find(w => w.name === name);
  }

  /**
   * Get collections for a specific workspace
   */
  getCollectionsForWorkspace(workspaceId: string) {
    const seedData = this.getSeedData();
    return seedData.collections.filter(c => c.workspaceId === workspaceId);
  }

  /**
   * Get requests for a specific collection
   */
  getRequestsForCollection(collectionId: string) {
    const seedData = this.getSeedData();
    return seedData.requests.filter(r => r.collectionId === collectionId);
  }

  /**
   * Get environments for a specific workspace
   */
  getEnvironmentsForWorkspace(workspaceId: string) {
    const seedData = this.getSeedData();
    return seedData.environments.filter(e => e.workspaceId === workspaceId);
  }

  /**
   * Get request history for a specific workspace
   */
  getRequestHistoryForWorkspace(workspaceId: string) {
    const seedData = this.getSeedData();
    return seedData.requestHistory.filter(h => h.workspaceId === workspaceId);
  }

  /**
   * Get a random workspace
   */
  getRandomWorkspace() {
    const seedData = this.getSeedData();
    return seedData.workspaces[Math.floor(Math.random() * seedData.workspaces.length)];
  }

  /**
   * Get a random collection
   */
  getRandomCollection() {
    const seedData = this.getSeedData();
    return seedData.collections[Math.floor(Math.random() * seedData.collections.length)];
  }

  /**
   * Get a random request
   */
  getRandomRequest() {
    const seedData = this.getSeedData();
    return seedData.requests[Math.floor(Math.random() * seedData.requests.length)];
  }
}

// Global test database instance
export const testDb = new TestDatabase();

// Helper functions for common test scenarios
export const withSeededDatabase = async <T>(
  testFn: (seedData: SeedData) => Promise<T>
): Promise<T> => {
  const seedData = await testDb.reset();
  try {
    return await testFn(seedData);
  } finally {
    // Optionally clear after test - uncomment if you want clean state between tests
    // await testDb.clear();
  }
};

export const withCleanDatabase = async <T>(
  testFn: () => Promise<T>
): Promise<T> => {
  await testDb.clear();
  try {
    return await testFn();
  } finally {
    // Database is already clean
  }
};
