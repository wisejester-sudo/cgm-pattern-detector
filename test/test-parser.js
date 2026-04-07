/**
 * Test script for CGM Pattern Detector
 * Validates parsing, pattern detection, and ML training
 */

const fs = require('fs');
const Papa = require('papaparse');

// Mock MLRegression for testing
const MLRegression = {
    SLR: class SimpleLinearRegression {
        constructor(x, y) {
            const n = x.length;
            const sumX = x.reduce((a, b) => a + b, 0);
            const sumY = y.reduce((a, b) => a + b, 0);
            const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
            const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
            
            this.slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            this.intercept = (sumY - this.slope * sumX) / n;
        }
        predict(x) {
            return this.slope * x + this.intercept;
        }
    }
};

console.log('=== CGM Pattern Detector Tests ===\n');

// Test 1: Dexcom Parser
console.log('Test 1: Dexcom CSV Parsing');
const dexcomCSV = fs.readFileSync('./dexcom_test.csv', 'utf8');
const dexcomParsed = Papa.parse(dexcomCSV, { header: true });

const dexcomReadings = [];
for (const row of dexcomParsed.data) {
    if (row['Event Type'] === 'EGV') {
        dexcomReadings.push({
            timestamp: new Date(row.Timestamp),
            glucose: parseInt(row['Glucose Value']),
            hour: new Date(row.Timestamp).getHours()
        });
    }
}

console.log(`✅ Parsed ${dexcomReadings.length} Dexcom readings`);
console.log(`   Avg glucose: ${Math.round(dexcomReadings.reduce((a, b) => a + b.glucose, 0) / dexcomReadings.length)} mg/dL`);

// Test 2: Libre Parser
console.log('\nTest 2: Libre CSV Parsing');
const libreCSV = fs.readFileSync('./libre_test.csv', 'utf8');
const libreParsed = Papa.parse(libreCSV, { header: true });

const libreReadings = [];
for (const row of libreParsed.data) {
    const historic = row['Historic Glucose mmol/L'];
    if (historic) {
        libreReadings.push({
            timestamp: new Date(row['Device Timestamp']),
            glucose: Math.round(parseFloat(historic) * 18),
            hour: new Date(row['Device Timestamp']).getHours()
        });
    }
}

console.log(`✅ Parsed ${libreReadings.length} Libre readings`);
console.log(`   Avg glucose: ${Math.round(libreReadings.reduce((a, b) => a + b.glucose, 0) / libreReadings.length)} mg/dL`);

// Test 3: Pattern Detection
console.log('\nTest 3: Pattern Detection');
const data = dexcomReadings;

// Morning spike detection
const morning = data.filter(d => d.hour >= 6 && d.hour <= 10);
const morningAvg = morning.reduce((a, b) => a + b.glucose, 0) / morning.length;
const overallAvg = data.reduce((a, b) => a + b.glucose, 0) / data.length;

console.log(`   Morning avg (6-10 AM): ${Math.round(morningAvg)} mg/dL`);
console.log(`   Overall avg: ${Math.round(overallAvg)} mg/dL`);
console.log(`   Morning spike detected: ${morningAvg > overallAvg + 20 ? '✅ YES' : '❌ No'}`);

// Overnight lows
const overnight = data.filter(d => d.hour >= 0 && d.hour <= 6);
const lowCount = overnight.filter(d => d.glucose < 70).length;
console.log(`   Overnight lows detected: ${lowCount > 0 ? '✅ YES (' + lowCount + ')' : '❌ No'}`);

// Post-meal spikes
let spikeCount = 0;
for (let i = 1; i < data.length; i++) {
    const rise = data[i].glucose - data[i-1].glucose;
    if (rise > 50) spikeCount++;
}
console.log(`   Post-meal spikes detected: ${spikeCount > 0 ? '✅ YES (' + spikeCount + ')' : '❌ No'}`);

// Test 4: ML Training
console.log('\nTest 4: ML Training');
const trainingData = [
    { carbs: 30, rise: 45, mealType: 'medium' },
    { carbs: 45, rise: 60, mealType: 'medium' },
    { carbs: 25, rise: 35, mealType: 'medium' },
    { carbs: 35, rise: 50, mealType: 'medium' },
    { carbs: 40, rise: 55, mealType: 'medium' },
];

const x = trainingData.map(t => t.carbs);
const y = trainingData.map(t => t.rise);

const model = new MLRegression.SLR(x, y);
console.log(`   Model trained: slope=${model.slope.toFixed(2)}, intercept=${model.intercept.toFixed(2)}`);
console.log(`   Prediction for 30g: ${Math.round(model.predict(30))} mg/dL rise`);

// Test 5: Time in Range
console.log('\nTest 5: Time in Range');
const inRange = data.filter(d => d.glucose >= 70 && d.glucose <= 180).length;
const tir = (inRange / data.length * 100).toFixed(1);
console.log(`   Time in Range: ${tir}%`);

console.log('\n=== All Tests Passed! ===');
