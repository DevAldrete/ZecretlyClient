import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import {
  workspacesTable,
  collectionsTable,
  requestsTable,
  environmentsTable,
  requestHistoryTable,
} from './schema';

// Create a separate database connection for seeding
const createSeedDb = (connectionString: string) => {
  const pool = new Pool({ connectionString });
  return drizzle(pool);
};

export interface SeedData {
  workspaces: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  collections: Array<{
    id: string;
    workspaceId?: string;
    name: string;
    description?: string;
  }>;
  requests: Array<{
    id: string;
    collectionId?: string;
    name: string;
    method: string;
    url: string;
    headers?: any;
    bodyType?: string;
    bodyContent?: string;
    queryParams?: any;
    authType?: string;
    authDetails?: any;
    preRequestScript?: string;
    postRequestScript?: string;
    sortOrder?: number;
    status: number;
    description?: string;
  }>;
  environments: Array<{
    id: string;
    workspaceId?: string;
    name: string;
    variables?: any;
    isActive?: boolean;
  }>;
  requestHistory: Array<{
    id: string;
    sourceRequestId?: string;
    method: string;
    url: string;
    requestHeaders?: any;
    requestBodyType?: string;
    requestBodyContent?: string;
    responseStatusCode?: number;
    responseHeaders?: any;
    responseBody?: string;
    durationMs?: number;
    collectionId?: string;
    workspaceId?: string;
  }>;
}

export const generateSeedData = (): SeedData => {
  // Generate workspaces
  const workspaces = [
    {
      id: randomUUID(),
      name: 'Personal Projects',
      description: 'My personal API testing workspace',
    },
    {
      id: randomUUID(),
      name: 'Company APIs',
      description: 'Corporate API endpoints and testing',
    },
    {
      id: randomUUID(),
      name: 'Third Party Services',
      description: 'External service integrations',
    },
  ];

  // Generate collections
  const collections = [
    {
      id: randomUUID(),
      workspaceId: workspaces[0].id,
      name: 'User Management',
      description: 'User CRUD operations',
    },
    {
      id: randomUUID(),
      workspaceId: workspaces[0].id,
      name: 'Authentication',
      description: 'Login, logout, and token management',
    },
    {
      id: randomUUID(),
      workspaceId: workspaces[1].id,
      name: 'Payment Processing',
      description: 'Payment gateway integration',
    },
    {
      id: randomUUID(),
      workspaceId: workspaces[1].id,
      name: 'Inventory Management',
      description: 'Product and inventory APIs',
    },
    {
      id: randomUUID(),
      workspaceId: workspaces[2].id,
      name: 'Social Media APIs',
      description: 'Twitter, Facebook, Instagram integrations',
    },
    {
      id: randomUUID(),
      workspaceId: null, // Unassigned collection
      name: 'Miscellaneous',
      description: 'Various testing endpoints',
    },
  ];

  // Generate requests
  const requests = [
    // User Management requests
    {
      id: randomUUID(),
      collectionId: collections[0].id,
      name: 'Get All Users',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      headers: { 'Content-Type': 'application/json' },
      sortOrder: 1,
      status: 200,
      description: 'Retrieve all users from the system',
    },
    {
      id: randomUUID(),
      collectionId: collections[0].id,
      name: 'Get User by ID',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users/{{userId}}',
      headers: { 'Content-Type': 'application/json' },
      sortOrder: 2,
      status: 200,
      description: 'Get a specific user by their ID',
    },
    {
      id: randomUUID(),
      collectionId: collections[0].id,
      name: 'Create User',
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/users',
      headers: { 'Content-Type': 'application/json' },
      bodyType: 'json',
      bodyContent: JSON.stringify({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        phone: '1-770-736-8031 x56442',
        website: 'hildegard.org',
      }),
      sortOrder: 3,
      status: 201,
      description: 'Create a new user',
    },
    {
      id: randomUUID(),
      collectionId: collections[0].id,
      name: 'Update User',
      method: 'PUT',
      url: 'https://jsonplaceholder.typicode.com/users/{{userId}}',
      headers: { 'Content-Type': 'application/json' },
      bodyType: 'json',
      bodyContent: JSON.stringify({
        name: 'Jane Doe',
        username: 'janedoe',
        email: 'jane@example.com',
      }),
      sortOrder: 4,
      status: 200,
      description: 'Update an existing user',
    },
    {
      id: randomUUID(),
      collectionId: collections[0].id,
      name: 'Delete User',
      method: 'DELETE',
      url: 'https://jsonplaceholder.typicode.com/users/{{userId}}',
      headers: { 'Content-Type': 'application/json' },
      sortOrder: 5,
      status: 200,
      description: 'Delete a user from the system',
    },

    // Authentication requests
    {
      id: randomUUID(),
      collectionId: collections[1].id,
      name: 'Login',
      method: 'POST',
      url: 'https://api.example.com/auth/login',
      headers: { 'Content-Type': 'application/json' },
      bodyType: 'json',
      bodyContent: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
      sortOrder: 1,
      status: 200,
      description: 'User login endpoint',
    },
    {
      id: randomUUID(),
      collectionId: collections[1].id,
      name: 'Refresh Token',
      method: 'POST',
      url: 'https://api.example.com/auth/refresh',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{refreshToken}}'
      },
      sortOrder: 2,
      status: 200,
      description: 'Refresh access token',
    },
    {
      id: randomUUID(),
      collectionId: collections[1].id,
      name: 'Logout',
      method: 'POST',
      url: 'https://api.example.com/auth/logout',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{accessToken}}'
      },
      sortOrder: 3,
      status: 200,
      description: 'User logout endpoint',
    },

    // Payment Processing requests
    {
      id: randomUUID(),
      collectionId: collections[2].id,
      name: 'Process Payment',
      method: 'POST',
      url: 'https://api.stripe.com/v1/charges',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer {{stripeSecretKey}}'
      },
      bodyType: 'x-www-form-urlencoded',
      bodyContent: 'amount=2000&currency=usd&source=tok_visa&description=Test payment',
      sortOrder: 1,
      status: 200,
      description: 'Process a payment via Stripe',
    },
    {
      id: randomUUID(),
      collectionId: collections[2].id,
      name: 'Get Payment Status',
      method: 'GET',
      url: 'https://api.stripe.com/v1/charges/{{chargeId}}',
      headers: {
        'Authorization': 'Bearer {{stripeSecretKey}}'
      },
      sortOrder: 2,
      status: 200,
      description: 'Check payment status',
    },

    // Miscellaneous requests
    {
      id: randomUUID(),
      collectionId: collections[5].id,
      name: 'Health Check',
      method: 'GET',
      url: 'https://httpbin.org/status/200',
      headers: { 'User-Agent': 'ZecretlyClient/1.0.0' },
      sortOrder: 1,
      status: 200,
      description: 'Simple health check endpoint',
    },
    {
      id: randomUUID(),
      collectionId: collections[5].id,
      name: 'Echo Request',
      method: 'POST',
      url: 'https://httpbin.org/post',
      headers: { 'Content-Type': 'application/json' },
      bodyType: 'json',
      bodyContent: JSON.stringify({ message: 'Hello, World!' }),
      sortOrder: 2,
      status: 200,
      description: 'Echo back the request data',
    },
  ];

  // Generate environments
  const environments = [
    {
      id: randomUUID(),
      workspaceId: workspaces[0].id,
      name: 'Development',
      variables: {
        BASE_URL: 'https://dev-api.example.com',
        API_KEY: 'dev-api-key-123',
        VERSION: 'v1',
        userId: '1',
        accessToken: 'dev-access-token-xyz',
        refreshToken: 'dev-refresh-token-abc',
      },
      isActive: true,
    },
    {
      id: randomUUID(),
      workspaceId: workspaces[0].id,
      name: 'Staging',
      variables: {
        BASE_URL: 'https://staging-api.example.com',
        API_KEY: 'staging-api-key-456',
        VERSION: 'v1',
        userId: '2',
        accessToken: 'staging-access-token-xyz',
        refreshToken: 'staging-refresh-token-def',
      },
      isActive: false,
    },
    {
      id: randomUUID(),
      workspaceId: workspaces[1].id,
      name: 'Production',
      variables: {
        BASE_URL: 'https://api.example.com',
        API_KEY: 'prod-api-key-789',
        VERSION: 'v2',
        stripeSecretKey: 'sk_test_...',
        chargeId: 'ch_1234567890',
      },
      isActive: true,
    },
    {
      id: randomUUID(),
      workspaceId: workspaces[2].id,
      name: 'Third Party',
      variables: {
        TWITTER_API_KEY: 'twitter-key-123',
        FACEBOOK_APP_ID: 'fb-app-456',
        INSTAGRAM_TOKEN: 'ig-token-789',
      },
      isActive: false,
    },
  ];

  // Generate request history
  const requestHistory = [
    {
      id: randomUUID(),
      sourceRequestId: requests[0].id, // Get All Users
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      requestHeaders: { 'Content-Type': 'application/json' },
      responseStatusCode: 200,
      responseHeaders: { 'Content-Type': 'application/json; charset=utf-8' },
      responseBody: JSON.stringify([
        { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
        { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' },
      ]),
      durationMs: 245,
      collectionId: collections[0].id,
      workspaceId: workspaces[0].id,
    },
    {
      id: randomUUID(),
      sourceRequestId: requests[2].id, // Create User
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/users',
      requestHeaders: { 'Content-Type': 'application/json' },
      requestBodyType: 'json',
      requestBodyContent: JSON.stringify({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
      }),
      responseStatusCode: 201,
      responseHeaders: { 'Content-Type': 'application/json; charset=utf-8' },
      responseBody: JSON.stringify({
        id: 11,
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
      }),
      durationMs: 387,
      collectionId: collections[0].id,
      workspaceId: workspaces[0].id,
    },
    {
      id: randomUUID(),
      sourceRequestId: requests[5].id, // Login
      method: 'POST',
      url: 'https://api.example.com/auth/login',
      requestHeaders: { 'Content-Type': 'application/json' },
      requestBodyType: 'json',
      requestBodyContent: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
      responseStatusCode: 200,
      responseHeaders: { 'Content-Type': 'application/json' },
      responseBody: JSON.stringify({
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'refresh_token_here',
        user: { id: 1, email: 'user@example.com' },
      }),
      durationMs: 156,
      collectionId: collections[1].id,
      workspaceId: workspaces[0].id,
    },
  ];

  return {
    workspaces,
    collections,
    requests,
    environments,
    requestHistory,
  };
};

export const seedDatabase = async (connectionString: string): Promise<void> => {
  const db = createSeedDb(connectionString);
  const seedData = generateSeedData();

  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order due to foreign keys)
    console.log('🧹 Clearing existing data...');
    await db.delete(requestHistoryTable);
    await db.delete(requestsTable);
    await db.delete(environmentsTable);
    await db.delete(collectionsTable);
    await db.delete(workspacesTable);

    // Insert workspaces
    console.log('📁 Seeding workspaces...');
    await db.insert(workspacesTable).values(seedData.workspaces);

    // Insert collections
    console.log('📂 Seeding collections...');
    await db.insert(collectionsTable).values(seedData.collections);

    // Insert requests
    console.log('🔗 Seeding requests...');
    await db.insert(requestsTable).values(seedData.requests);

    // Insert environments
    console.log('🌍 Seeding environments...');
    await db.insert(environmentsTable).values(seedData.environments);

    // Insert request history
    console.log('📊 Seeding request history...');
    await db.insert(requestHistoryTable).values(seedData.requestHistory);

    console.log('✅ Database seeding completed successfully!');
    console.log(`   - ${seedData.workspaces.length} workspaces`);
    console.log(`   - ${seedData.collections.length} collections`);
    console.log(`   - ${seedData.requests.length} requests`);
    console.log(`   - ${seedData.environments.length} environments`);
    console.log(`   - ${seedData.requestHistory.length} request history entries`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

export const clearDatabase = async (connectionString: string): Promise<void> => {
  const db = createSeedDb(connectionString);

  try {
    console.log('🧹 Clearing database...');

    // Clear in reverse order due to foreign keys
    await db.delete(requestHistoryTable);
    await db.delete(requestsTable);
    await db.delete(environmentsTable);
    await db.delete(collectionsTable);
    await db.delete(workspacesTable);

    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

// CLI interface for running seeds
if (require.main === module) {
  const connectionString = process.env.ZECRETLY_DB_CONNECTION_URI;

  if (!connectionString) {
    console.error('❌ ZECRETLY_DB_CONNECTION_URI environment variable is required');
    process.exit(1);
  }

  const command = process.argv[2];

  switch (command) {
    case 'seed':
      seedDatabase(connectionString)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'clear':
      clearDatabase(connectionString)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    default:
      console.log('Usage: tsx src/db/seed.ts [seed|clear]');
      process.exit(1);
  }
}
