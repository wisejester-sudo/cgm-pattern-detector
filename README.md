# CGM Pattern Detector

Analyze your continuous glucose monitor (CGM) data from Dexcom and Freestyle Libre to discover patterns, trends, and insights.

## What it does

Upload your CGM CSV export and instantly discover:
- **Time in Range** - How much time you spend in target glucose range
- **Pattern Detection** - When you typically spike or drop
- **Daily Trends** - Your glucose patterns by time of day
- **Meal Impact** - How different foods affect you (with manual logging)
- **Sleep Analysis** - Overnight glucose patterns

## Supported CGMs

- ✅ **Dexcom** (G6, G7) - Via Dexcom Clarity export
- ✅ **Freestyle Libre** (2, 3) - Via LibreView export

## Quick Start

1. **Export your CGM data:**
   - Dexcom: Clarity → Export Data → CSV
   - Freestyle: LibreView → Download Glucose Data → CSV

2. **Open the tool:**
   ```bash
   open index.html
   # Or visit https://wisejester-sudo.github.io/cgm-pattern-detector
   ```

3. **Upload and analyze:**
   - Select your CGM brand
   - Upload CSV file
   - Get instant insights

## Privacy

- **100% client-side** - Your data never leaves your browser
- No server, no tracking, no data collection
- Open source, inspect the code

## Features

- 📊 **Visual glucose charts** - Interactive time-series
- 🔍 **Pattern detection** - Automatic spike/drop identification
- ⏰ **Time-based analysis** - Morning, afternoon, evening, overnight
- 📈 **Statistics** - Time in range, averages, standard deviation
- 💡 **Actionable insights** - "You spike 85% of mornings at 9 AM"

## Technical

- Pure HTML/JavaScript - no build step
- Uses Chart.js for visualization
- Papa Parse for CSV parsing
- Works offline after first load

## Part of Mieru Health

This tool is part of [Mieru Health](https://mieru.health) - making CGM data actually useful.

## License

MIT - Free to use, modify, and share.
