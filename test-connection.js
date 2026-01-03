const https = require('https');

const url = 'https://jjdimrrnonaptfblkmbg.supabase.co';

console.log('Testing connectivity to:', url);

https.get(url, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', res.headers);
    res.on('data', (d) => {
        // process.stdout.write(d);
    });
}).on('error', (e) => {
    console.error('Connection Error:', e);
});
