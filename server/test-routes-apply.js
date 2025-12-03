console.log('=== Testing Route Application ===\n');

const express = require('express');
const testApp = express();

console.log('1. Fresh Express app created');
console.log('   Has _router before use():', !!testApp._router);

console.log('\n2. Loading routes module...');
const routes = require('./routes/index.js');
console.log('   Routes type:', typeof routes);

console.log('\n3. Applying routes with app.use()...');
try {
    testApp.use(routes);
    console.log('✅ app.use(routes) executed successfully');
} catch (error) {
    console.error('❌ Error in app.use(routes):', error.message);
}

console.log('\n4. Checking router after app.use()...');
console.log('   Has _router after use():', !!testApp._router);

if (testApp._router && testApp._router.stack) {
    console.log('   Router stack length:', testApp._router.stack.length);
    console.log('\n5. Routes in stack:');
    testApp._router.stack.forEach((layer, i) => {
        if (layer.route) {
            console.log(`   [${i}] Route: ${Object.keys(layer.route.methods).join(',')} ${layer.route.path}`);
        } else if (layer.name === 'router') {
            console.log(`   [${i}] Router middleware`);
        } else {
            console.log(`   [${i}] ${layer.name} middleware`);
        }
    });
}

console.log('\n=== Now testing actual app.js ===\n');
const app = require('./app.js');
console.log('app.js loaded');
console.log('Has _router:', !!app._router);
if (app._router && app._router.stack) {
    console.log('Stack length:', app._router.stack.length);
}
