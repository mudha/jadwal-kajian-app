import { extractCoordinatesFromGmapsUrl } from './gmaps-utils';

// Test various URL formats
const testUrls = [
    'https://maps.google.com/?q=-6.2088,106.8456',
    'https://www.google.com/maps/place/@-6.2088,106.8456,17z',
    'https://www.google.com/maps?q=-6.2088,106.8456',
    'https://maps.app.goo.gl/xyz', // This won't work without redirect
    'https://www.google.com/maps/place/Masjid+Al-Ikhlas/@-6.2088,106.8456',
    'https://www.google.com/maps/dir//-6.2088,106.8456',
    // Real example from database (you can add actual URLs here)
    'https://maps.app.goo.gl/Abc123',
];

console.log('Testing URL extraction:\n');

testUrls.forEach((url, index) => {
    console.log(`Test ${index + 1}: ${url}`);
    const result = extractCoordinatesFromGmapsUrl(url);
    if (result) {
        console.log(`  ✓ Success: lat=${result.lat}, lng=${result.lng}`);
    } else {
        console.log(`  ✗ Failed to extract coordinates`);
    }
    console.log('');
});
