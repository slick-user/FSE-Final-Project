const app = require('./app');
const listEndpoints = require('express-list-endpoints');

console.log('Registered Routes:');
try {
    const endpoints = listEndpoints(app);
    endpoints.forEach(endpoint => {
        console.log(`${endpoint.methods.join(', ')} ${endpoint.path}`);
    });
} catch (error) {
    console.error('Error listing endpoints:', error);
}
