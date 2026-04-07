# CGM Pattern Detector Test Files

This folder contains comprehensive test files for validating the CGM Pattern Detector.

## Test Files

### 1. dexcom_comprehensive_test.csv
**Format:** Dexcom G6/G7 (Clarity Export)  
**Units:** mg/dL  
**Duration:** 24 hours of simulated data

**Contains:**
- **Overnight lows (Somogyi effect):** Glucose drops to 50-65 mg/dL between 2-3 AM, followed by rebound high to 175+ mg/dL by 5 AM
- **Dawn phenomenon:** Natural morning cortisol rise from 4 AM to 8 AM, peaking at 175 mg/dL
- **Post-meal spikes:** 
  - Lunch (12:00 PM): 45g carbs (Pizza) → rises from 95 to 170 mg/dL
  - Dinner (6:00 PM): 30g carbs (Rice) → rises from 100 to 140 mg/dL
- **Time in Range scenarios:** Periods of stability, highs, and lows

**Expected Detections:**
- Somogyi effect (rebound after overnight low)
- Morning spikes >160 mg/dL
- 2 meal events with carb data
- Overnight lows (<70 mg/dL)

---

### 2. libre_comprehensive_test.csv
**Format:** Freestyle Libre 2/3 (LibreView Export)  
**Units:** mmol/L (converted to mg/dL in app)  
**Duration:** 24 hours of simulated data

**Contains:**
- **Same patterns as Dexcom file** but in Libre format:
  - Overnight lows: 2.8-3.9 mmol/L (50-70 mg/dL)
  - Dawn phenomenon: rises to 9.9 mmol/L (178 mg/dL) by 5 AM
  - Post-meal spikes:
    - Lunch: 45g carbs (Pizza) → 5.3 to 9.4 mmol/L (95 to 169 mg/dL)
    - Dinner: 30g carbs (Rice) → 5.6 to 7.8 mmol/L (100 to 140 mg/dL)

**Key Differences from Dexcom:**
- Uses mmol/L units (app auto-converts using ×18 factor)
- Different CSV column structure
- Record Type field indicates readings (0) vs food entries (5)
- Food Carbohydrates column for meal data

**Expected Detections:**
- Same patterns as Dexcom file
- Demonstrates unit conversion works correctly
- Shows food parsing from Libre format

---

## How to Use These Test Files

### Quick Validation
1. Open the CGM Pattern Detector
2. Select "Dexcom" and upload `dexcom_comprehensive_test.csv`
3. Click "Analyze Patterns"
4. Verify you see:
   - Time in Range calculation
   - Pattern detection section with warnings
   - Meal analysis section with Pizza and Rice entries
   - Personal carb ratio calculation

5. Repeat with "Freestyle Libre" and `libre_comprehensive_test.csv`
6. Should show identical pattern detections (after unit conversion)

### What to Look For

**Pattern Detection Section:**
- ⚠️ "Somogyi effect: Rebound high after overnight lows"
- ⚠️ "Morning spikes detected: 73% of mornings >160 mg/dL"
- ⚠️ "4 overnight lows detected (<70 mg/dL)"

**Meal Analysis Section:**
- Personal carb ratio (should calculate from logged meals)
- Foods that spike you (Pizza should be flagged)
- Foods with minimal impact (Rice should be lower impact)

**Statistics:**
- Time in Range percentage
- Average glucose
- Glucose Management Indicator (GMI)

---

## Creating Your Own Test Files

### Dexcom Format
```csv
Timestamp,Event Type,Event Subtype,Glucose Value,Carb Value,Notes
2026-04-06T12:00:00Z,EGV,,120,,
2026-04-06T12:05:00Z,Food,,,45,Pizza
```

### Libre Format
```csv
Device Timestamp,Record Type,Historic Glucose mmol/L,Food Carbohydrates (grams),Notes
2026-04-06 12:00,0,6.7,,Lunch
2026-04-06 12:00,5,,45,Pizza
```

---

## Testing Checklist

- [ ] Upload Dexcom file → No errors
- [ ] Upload Libre file → No errors
- [ ] Pattern detection shows warnings
- [ ] Meal analysis section appears
- [ ] Charts render correctly
- [ ] Statistics calculate properly
- [ ] Time in Range percentage shown
- [ ] Personal carb ratio calculated

---

## Troubleshooting

**File won't upload:**
- Check CSV format matches your CGM brand
- Ensure file has .csv extension
- Verify glucose values are numeric (not "Low" or "High")

**No patterns detected:**
- Test files should always show patterns (by design)
- If not detecting, check browser console for errors
- Verify Chart.js and Papa Parse loaded correctly

**Meals not showing:**
- Dexcom: Ensure Event Type = "Food" and Carb Value > 0
- Libre: Ensure Record Type = 5 and Food Carbohydrates > 0

---

## Data Privacy Note

These test files contain **simulated data only** - no real patient information. They are safe to share and use for testing purposes.
