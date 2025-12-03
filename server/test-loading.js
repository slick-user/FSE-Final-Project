console.log('Testing module loading...\n');

try {
    console.log('1. Loading routes/index.js...');
    const routes = require('./routes/index.js');
    console.log('✅ routes/index.js loaded successfully');
    console.log('   Type:', typeof routes);
    console.log('   Is function:', typeof routes === 'function');

    console.log('\n2. Loading app.js...');
    const app = require('./app.js');
    console.log('✅ app.js loaded successfully');
    console.log('   Type:', typeof app);
    console.log('   Has _router:', !!app._router);
    console.log('   Has listen:', typeof app.listen === 'function');

    console.log('\n3. Checking if routes were applied...');
    if (app._router) {
        console.log('✅ Router exists');
        console.log('   Stack length:', app._router.stack ? app._router.stack.length : 'undefined');
    } else {
        console.log('❌ Router does NOT exist');
    }

} catch (error) {
    console.error('\n❌ Error loading modules:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
}
