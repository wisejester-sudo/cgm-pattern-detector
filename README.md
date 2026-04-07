# CGM Pattern Detector

**Analyze your CGM data to discover patterns, trends, and personalized food insights.**

🩺 **Medical Disclaimer:** *This is NOT medical advice. Always consult your healthcare provider before making diabetes management decisions.*

## 🌟 What Makes This Different

Unlike basic CGM viewers, this tool provides:
- **Automatic meal detection** from glucose patterns
- **Personalized food impact analysis** - See which foods spike you most
- **Pattern recognition** - Somogyi effect, Dawn phenomenon, overnight lows
- **Personal carb ratios** - Calculate your mg/dL rise per gram of carbs
- **Comprehensive insights** - Not just raw data, but actionable intelligence

## ✨ Features

### 📊 Core Analysis
- **Time in Range** - Percentage spent in 70-180 mg/dL target
- **Visual charts** - Interactive glucose time-series with Chart.js
- **Statistics** - Averages, standard deviation, glucose management indicator (GMI)
- **Hourly patterns** - When you're highest/lowest throughout the day

### 🔍 Pattern Detection
- **Overnight lows** - Dangerous hypoglycemia while sleeping
- **Morning spikes** - Dawn phenomenon vs Somogyi effect detection
- **Post-meal rises** - Automatic meal timing identification
- **Day-of-week patterns** - Weekend vs weekday differences

### 🍽️ Comprehensive Meal Analysis
- **Automatic meal detection** - Identifies meals from glucose curves
- **Food impact scoring** - mg/dL rise per gram of carbs per food
- **Foods that spike you** - High-impact foods to watch
- **Safe foods** - Low-impact options that work for you
- **Personal carb ratio** - Your unique glucose response to carbs

### 🔒 Privacy First
- **100% client-side** - Zero data sent to any server
- **No tracking** - No analytics, no cookies, no user accounts
- **Open source** - Inspect every line of code
- **Works offline** - After first load, no internet needed

## 🚀 Quick Start

### 1. Export Your CGM Data

**Dexcom (G6/G7):**
1. Open Dexcom Clarity (clarity.dexcom.com)
2. Go to Reports → Export Data
3. Select date range
4. Download CSV

**Freestyle Libre (2/3):**
1. Log into LibreView (libreview.com)
2. Go to Glucose Reports
3. Select "Download Data"
4. Export as CSV

### 2. Analyze Your Data

**Option A: Online (easiest)**
```
https://wisejester-sudo.github.io/cgm-pattern-detector
```

**Option B: Local (most private)**
```bash
git clone https://github.com/wisejester-sudo/cgm-pattern-detector.git
cd cgm-pattern-detector
open index.html
```

### 3. Get Insights

1. Select your CGM brand (Dexcom or Freestyle)
2. Upload your CSV file
3. Click "Analyze Patterns"
4. Review comprehensive report

## 📋 Example Output

```
Your Personal Carb Ratio: 2.3 mg/dL per gram

🚨 Foods That Spike You:
- Pizza: 4.2 mg/dL/g (+85 mg/dL avg)
- Orange juice: 3.8 mg/dL/g (+57 mg/dL avg)

✅ Foods With Minimal Impact:
- Greek yogurt: 1.2 mg/dL/g (+15 mg/dL avg)
- Nuts: 0.9 mg/dL/g (+12 mg/dL avg)

💡 Personalized Recommendations:
- Pre-bolus 20 minutes before high-spike foods
- Consider smaller pizza portions (cut carbs by 30%)
- Good breakfast option: Greek yogurt with nuts

Pattern Detection:
- ⚠️ Somogyi effect detected (rebound highs)
- ⚠️ 73% of mornings show spike >160 mg/dL
- ⚠️ 4 overnight lows detected (<70 mg/dL)
```

## 🧪 Testing

A comprehensive test file is included:

```bash
# Test with sample data
curl -O https://raw.githubusercontent.com/wisejester-sudo/cgm-pattern-detector/main/test/comprehensive_test_file.csv
```

This test file includes:
- Overnight lows (Somogyi effect pattern)
- Dawn phenomenon (morning spike)
- Multiple meals with carb data
- Time in Range scenarios
- Pattern detection test cases

## 🏗️ Technical Details

### Architecture
- **Pure HTML/JavaScript** - No build step, no dependencies to install
- **Chart.js** - Interactive glucose visualization
- **Papa Parse** - Fast CSV parsing in browser
- **No ML libraries** - Lightweight, runs on any device

### Data Processing
- Parses Dexcom Clarity CSV format
- Parses Freestyle Libre CSV format
- Auto-detects meal timing from glucose curves
- Correlates meals with glucose responses
- Calculates personalized carb ratios

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Android)

## 📁 File Structure

```
cgm-pattern-detector/
├── index.html          # Main application (single file)
├── README.md           # This file
├── test/
│   ├── comprehensive_test_file.csv  # Full test data
│   ├── dexcom_test.csv              # Dexcom format test
│   ├── libre_test.csv               # Libre format test
│   └── TEST_COVERAGE.md             # Test documentation
└── .github/
    └── workflows/
        └── pages.yml    # GitHub Pages deployment
```

## 🔧 Development

### Local Development
```bash
# Clone repository
git clone https://github.com/wisejester-sudo/cgm-pattern-detector.git
cd cgm-pattern-detector

# Serve locally (any static server works)
python3 -m http.server 8000
# OR
npx serve .

# Open in browser
open http://localhost:8000
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with the comprehensive test file
5. Submit a pull request

## 🩺 Medical Notes

### Pattern Definitions
- **Dawn Phenomenon**: Natural cortisol rise causing morning highs without preceding lows
- **Somogyi Effect**: Rebound hyperglycemia after overnight hypoglycemia
- **Post-Meal Spike**: Glucose rise >50 mg/dL within 2 hours of eating
- **Overnight Low**: Any reading <70 mg/dL between 10 PM - 6 AM

### Recommendations
All recommendations are suggestions for discussion with your healthcare provider:
- Pre-bolus timing varies by person
- Carb ratios are estimates based on limited data
- Individual responses vary significantly

## 📝 CSV Format Support

### Dexcom Format
```csv
Timestamp,Event Type,Event Subtype,Glucose Value,Carb Value
2026-04-06T12:00:00Z,EGV,,120,
2026-04-06T12:05:00Z,Food,,,45
```

### Freestyle Format
```csv
Device Timestamp,Record Type,Historic Glucose mmol/L,Scan Glucose mmol/L,Food Carbohydrates (grams)
2026-04-06 12:00,0,6.7,,45
```

## 🌐 Part of Mieru Health

This tool is part of [Mieru Health](https://mieru.health) - making diabetes data actually useful through intelligent analysis and personalized insights.

## 📄 License

MIT License - Free to use, modify, and share. See [LICENSE](LICENSE) for details.

---

**Questions? Issues?** Open an issue on GitHub or reach out through Mieru Health.

**Disclaimer:** This tool is for educational and analytical purposes only. Always consult healthcare professionals for medical decisions.
