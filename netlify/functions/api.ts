import serverless from 'serverless-http';
// We need to import the compiled JavaScript file from the 'dist' directory
// Adjust the path based on the relative location from netlify/functions/api.ts to dist/server.js
// Assuming 'dist' is at the root, and 'netlify/functions' is also at the root:
import app from '../../dist/server'; // Adjust this path if your structure is different

// Wrap the Express app with serverless-http
export const handler = serverless(app);
