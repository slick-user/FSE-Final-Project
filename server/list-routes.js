const express = require('express');
const app = require('./app');

console.log('\n=== Registered Routes ===\n');

// Helper to extract path from regexp
function getPathFromRegexp(regexp) {
    return regexp.toString()
        .replace('/^', '')
        .replace('\\/?(?=\\/|$)/i', '')
        .replace(/\\\//g, '/')
        .replace(/\^/g, '')
        .replace(/\$/g, '')
        .replace(/\\/g, '')
        .replace(/\?/g, '')
        .replace(/\(\?=/g, '')
        .replace(/\|/g, '')
        .replace(/\)/g, '');
}

// List all routes
if (app._router && app._router.stack) {
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Direct route
            const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(', ');
            console.log(`${methods.padEnd(10)} ${middleware.route.path}`);
        } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
            // Mounted router
            const basePath = getPathFromRegexp(middleware.regexp);
            console.log(`\n--- Router mounted at: ${basePath || '/'} ---`);

            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const methods = Object.keys(handler.route.methods).map(m => m.toUpperCase()).join(', ');
                    const fullPath = basePath + handler.route.path;
                    console.log(`${methods.padEnd(10)} ${fullPath}`);
                }
            });
        }
    });
} else {
    console.log('ERROR: Router not initialized!');
}

console.log('\n=== End of Routes ===\n');
