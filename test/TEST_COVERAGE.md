# CGM Pattern Detector - Test Coverage

## Test Files

### 1. comprehensive_test.csv
**Tests:**
- ✅ Dexcom CSV parsing
- ✅ Somogyi effect detection (overnight lows + morning rebound)
- ✅ Dawn phenomenon detection
- ✅ Overnight low detection (2-3 AM readings <70)
- ✅ Trend prediction (rate calculation)
- ✅ Time in Range calculation
- ✅ Morning spike detection
- ✅ Post-meal rise detection

### 2. libre_test.csv
**Tests:**
- ✅ Freestyle Libre CSV parsing
- ✅ mmol/L to mg/dL conversion
- ✅ Overnight low detection
- ✅ Morning high detection
- ✅ Libre format auto-detection

### 3. multiday_test.csv
**Tests:**
- ✅ Day-of-week pattern detection
- ✅ Monday (April 1): Good control
- ✅ Tuesday (April 2): Poor control (spike)
- ✅ Thursday (April 4): Poor control
- ✅ Saturday (April 6): Worst control (highest spike)
- ✅ Should detect: "Saturday: Lowest control" insight

### 4. dexcom_test.csv
**Tests:**
- ✅ Basic Dexcom parsing
- ✅ Pattern detection
- ✅ Summary statistics

## How to Test

1. Go to: https://wisejester-sudo.github.io/cgm-pattern-detector
2. Select CGM type (Dexcom or Libre)
3. Upload test CSV
4. Verify expected patterns appear

## Expected Results

### comprehensive_test.csv:
- **Somogyi Effect**: "Rebound high after overnight low"
- **Overnight Lows**: "2 low readings detected"
- **Trend**: Shows rapid drop prediction

### libre_test.csv:
- **Libre Format**: Parsed correctly
- **Conversion**: mmol/L × 18 = mg/dL
- **Patterns**: Overnight lows detected

### multiday_test.csv:
- **Day-of-Week**: "Saturday: Lowest control" (highest spike day)
- **TIR**: Shows different control per day

## Feature Coverage Summary

| Feature | Test File | Status |
|---------|-----------|--------|
| Dexcom parsing | comprehensive_test.csv, dexcom_test.csv | ✅ |
| Libre parsing | libre_test.csv | ✅ |
| Morning spike | comprehensive_test.csv | ✅ |
| Somogyi effect | comprehensive_test.csv | ✅ |
| Overnight lows | comprehensive_test.csv, libre_test.csv | ✅ |
| Day-of-week | multiday_test.csv | ✅ |
| Trend prediction | comprehensive_test.csv | ✅ |
| Time in Range | All files | ✅ |
| ML meal logging | (Requires manual logging) | ⚠️ |

## Manual Testing Required

**ML Meal Logging**: Requires user to:
1. Upload CGM data
2. Click "Log Meal"
3. Enter time, carbs, type
4. After 5+ meals, ML trains
5. Verify personalized predictions appear
