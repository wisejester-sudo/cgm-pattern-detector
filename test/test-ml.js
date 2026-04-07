/**
 * Test ML Meal Logging and Training
 * Simulates user logging meals and verifies ML training
 */

const MLRegression = require('ml-regression');

console.log('=== Testing ML Meal Logging ===\n');

// Simulate training data (normally from localStorage)
let trainingData = [];

// Simulate user logging 6 meals
const meals = [
    { timestamp: '2026-04-06T08:00:00', carbs: 30, mealType: 'medium', rise: 45 },
    { timestamp: '2026-04-06T12:00:00', carbs: 45, mealType: 'medium', rise: 60 },
    { timestamp: '2026-04-06T18:00:00', carbs: 35, mealType: 'medium', rise: 48 },
    { timestamp: '2026-04-07T08:00:00', carbs: 40, mealType: 'medium', rise: 55 },
    { timestamp: '2026-04-07T12:00:00', carbs: 50, mealType: 'medium', rise: 65 },
    { timestamp: '2026-04-07T18:00:00', carbs: 25, mealType: 'medium', rise: 38 },
];

console.log('Simulating user logging meals...\n');

meals.forEach((meal, i) => {
    trainingData.push(meal);
    console.log(`✅ Logged meal ${i + 1}: ${meal.carbs}g ${meal.mealType} → ${meal.rise} mg/dL rise`);
});

console.log('\nTotal meals logged:', trainingData.length);

// Check if enough to train
if (trainingData.length >= 5) {
    console.log('\n🧠 Training ML model...\n');
    
    // Train model (same logic as in index.html)
    const x = trainingData.map(t => t.carbs);
    const y = trainingData.map(t => t.rise);
    
    const model = new MLRegression.SLR(x, y);
    
    // Calculate R²
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    const ssTotal = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const predictions = x.map(val => model.predict(val));
    const ssResidual = y.reduce((sum, val, i) => sum + Math.pow(val - predictions[i], 2), 0);
    const r2 = 1 - (ssResidual / ssTotal);
    
    console.log('Model trained:');
    console.log(`  Slope: ${model.slope.toFixed(2)} mg/dL per gram`);
    console.log(`  Intercept: ${model.intercept.toFixed(2)}`);
    console.log(`  R²: ${r2.toFixed(3)} (${Math.round(r2 * 100)}% confidence)`);
    
    // Test predictions
    console.log('\n📊 Personalized Predictions:');
    [15, 30, 45, 60].forEach(carbs => {
        const predicted = Math.round(model.predict(carbs));
        console.log(`  ${carbs}g medium meal → ~${predicted} mg/dL rise`);
    });
    
    // Compare to generic estimate
    console.log('\n💡 vs Generic estimate (2.0 mg/dL/g):');
    [30, 45].forEach(carbs => {
        const personal = Math.round(model.predict(carbs));
        const generic = Math.round(carbs * 2.0);
        const diff = personal - generic;
        console.log(`  ${carbs}g: Personal ${personal} vs Generic ${generic} (${diff > 0 ? '+' : ''}${diff} mg/dL)`);
    });
    
    console.log('\n✅ ML Training Successful!');
} else {
    console.log('\n❌ Need 5+ meals to train (have:', trainingData.length + ')');
}

// Test fast carb model
console.log('\n--- Testing Fast Carbs ---');
const fastMeals = [
    { carbs: 15, rise: 55 },  // Juice
    { carbs: 20, rise: 68 },  // Candy
    { carbs: 15, rise: 52 },
    { carbs: 25, rise: 75 },
    { carbs: 20, rise: 65 },
];

const fastX = fastMeals.map(m => m.carbs);
const fastY = fastMeals.map(m => m.rise);
const fastModel = new MLRegression.SLR(fastX, fastY);

console.log(`Fast carb model: ${fastModel.slope.toFixed(2)} mg/dL per gram`);
console.log(`Prediction: 15g juice → ~${Math.round(fastModel.predict(15))} mg/dL rise`);

console.log('\n=== ML Tests Complete ===');
