# MEMORY.md - Curated Long-Term Memory

## User Operating Preferences (CRITICAL)

### GitHub Access (March 19, 2026)
**Status:** ✅ CONFIRMED - I have access to user's GitHub account

**Account:** `wisejester-sudo`
**Access Method:** GitHub CLI (`gh`) authenticated via token
**Token Scopes:** `gist`, `read:org`, `repo`, `workflow`
**Authentication:** Token stored in system keyring

**Capabilities:**
- Read private repositories
- View deployment status
- Check issues and PRs
- Access commit history
- Clone and manage repos

**Important:** Do not ask for permission to access GitHub - I already have it. Use proactively when needed.

---

### Proactive Sub-Agent Usage (March 15, 2026)
**User Direction**: Use sub-agents proactively without being told. Make it part of normal operations.

**Implementation:**
- Spawn sub-agents automatically when tasks can be parallelized
- Handle multiple independent issues simultaneously
- Don't wait for permission to use tools that make sense
- Be an assistant who thinks ahead, not just a command executor
- Take initiative in suggesting improvements

**When to use sub-agents:**
- Multiple unrelated bugs/issues to investigate
- Tasks that can be done in parallel
- Complex investigations that can be split up
- Any situation where parallel work is more efficient

**Never forget**: Be proactive, not reactive.

### Sub-Agent Task Template (CRITICAL)
**Template for reliable sub-agent execution:**

```
**Task:** [Specific, bounded description]

**Files to check:**
- /path/to/file.ts (lines X-Y)
- /path/to/other.tsx (function Z)

**Deliverable:**
- Root cause identified
- Code fix provided
- Test steps included

**When complete:**
Use `sessions_send` to report back to parent session with:
1. What you found
2. What you fixed (exact code)
3. Any issues encountered

**If stuck after 10 minutes:**
Report back with:
- What you tried
- Error messages
- What's blocking you
```

**Key rules:**
- Always include explicit "report back" instructions
- Never have sub-agents commit code - report fix for parent to commit
- Make tasks idempotent (retry-safe)
- Include specific file paths and line numbers

## Dispatchly - SMS-First HVAC Communication Tool (ACTIVE PROJECT)

**Status**: PRD Complete, v0 Code Generated, Ready for Development  
**Date**: March 9, 2026 (PRD), March 9, 2026 (v0 Code)  
**Target Launch**: 3-4 weeks

**What**: SMS-first customer communication tool for HVAC contractors  
**Target Users**: HVAC Harry (owner), Tech Tommy (field tech), Homeowner Hannah (customer)  
**Core Value**: 10-minute setup vs 6-12 months for ServiceTitan  
**Pricing**: $39/month Starter, $79/month Pro (v2), $199/month Enterprise (v3)

**Key Differentiation**:
- SMS-first architecture (not CRM with SMS bolt-on)
- Communication ONLY (not scheduling/invoicing/marketing)
- 10-minute setup vs competitors' 6-12 months
- $39/month vs $59-$500/month

**Tech Stack**: Next.js 14 + Supabase + Twilio + Vercel

**MVP Features**:
- Job Management (create, assign, status)
- Photo Management (upload, compress, 90-day retention)
- SMS Templates (pre-written + custom)
- Technician Mobile View (magic links, no login)
- Customer Photo Viewer (web link, no app download)
- Two-Way SMS

**User Flows**:
- Setup: < 10 minutes to first SMS
- Daily: < 2 minutes to create job
- Tech Update: < 60 seconds
- Customer: Receives SMS in < 30 seconds

**Development Status**:
- ✅ PRD complete (March 9, 2026)
- ✅ v0 code generated - Full Next.js 14 scaffold with Supabase integration
- ✅ Project structure: App Router, RLS policies, auth middleware, dashboard pages
- ✅ Database schema: Users, Technicians, Jobs, Updates, Photos, SMS Logs tables
- ✅ API endpoints scaffolded: /api/jobs, /api/updates, /api/upload
- 🔄 Next: Development sprint - SMS integration, Twilio webhooks, photo compression

**Files**:
- PRD: `/Users/kevron/.openclaw/workspace/projects/dispatchly/PRD.md`
- KG Entities: `/Users/kevron/.openclaw/workspace/projects/dispatchly/knowledge_graph_entities.json`
- v0 Code: `/Users/kevron/.openclaw/workspace/projects/dispatchly/v0-code/v0-dispatchly-main/`
- Supabase Setup: `/Users/kevron/.openclaw/workspace/projects/dispatchly/v0-code/v0-dispatchly-main/SUPABASE_SETUP.md`

---

## Sable Resources (SAE) - 2026 Catalyst Schedule

### ⚠️ MAJOR UPDATE (Feb 20, 2026)
**Previous analysis contained outdated assumptions. Current status verified through Feb 2026 research.**

### Quarterly Timeline
- **Q1 2026**
  - ✅ Zorro Option agreement finalized (Jan 15, 2026)
  - ✅ **Zorro option payment COMPLETED** (Feb 27, 2026)
  - ⛏️ **Moxico-funded drilling active at El Fierro** (started Feb 2025)
  - 🚨 **Don Julio on CARE & MAINTENANCE** (seeking new partner)
  - ~~Due diligence period extended to **February 28, 2026**~~ [PAID]

- **Q1-Q2 2026**
  - 🪨 **Zorro initial drill program** (late Q2 2026, self-funded)
  - 🔬 98 rock samples pending at Zorro
  - ⛏️ **El Fierro drilling continues** (Moxico-funded)

- **Q3-Q4 2026**
  - 🗺️ Zorro follow-up if results positive
  - ⛏️ El Fierro additional phases (Moxico-funded)

### Strategic Context - CORRECTED
- **El Fierro**: **PARTNER-FUNDED by Moxico Resources** (51% earn-in option)
  - Moxico committed: 20,000m drilling + US$2.14M total payments
  - Sable receives US$150k/year + retains 49%
  - **El Fierro is NOW the crown jewel** (funded, advancing)
  
- **Don Julio**: **UNFUNDED after South32 termination** (July 28, 2025)
  - South32 walked away after funding 12,717m drilling
  - Sable seeking new partner; project on care & maintenance
  - High potential but stalled without funding
  
- **Zorro**: New project (Jan 2026), self-funded, cheap option (US$1M/3yr)

### 🔥 WEBINAR UPDATE - Ruben Padilla (March 5, 2026)
**Source**: Sable Resources Corporate Update Webinar — Critical new intel

**EL FIERRO BREAKTHROUGH:**
- **Q4 2025 Drilling Results**: Hit **6% Cu, 0.3 g/t Au over 20m** in margin zones
- **23 CuEq** intercepts confirmed — best results to date
- **Strategy**: Drilling around barren core margins where high-grade mineralization concentrates
- **Status**: Q4 2025 drilling COMPLETE, assays PENDING (awaiting lab results)
- **Next Phase**: Q3-Q4 2026 drilling on northern and southern extensions
- **Scale**: 4km alteration zone with porphyry footprint — potentially multiple centers

**ZORRO — COMPANY-MAKER POTENTIAL:**
- **Discovery Zone**: 650m x 500m mineralized area
- **Grades**: Up to **4.3% Cu**, **120 g/t Au** in veins
- **Style**: Intrusion-related mineralization with breccias and intermediate sulfidation
- **Target**: Bulk tonnage, open-pittable deposit
- **Timeline**: Drill permits by Q2 (June), drilling starts end of Q2 2026
- **Cost Advantage**: $350/meter (vs $900/meter at high elevation) = 50% savings

**MOXICO PARTNERSHIP — CONFIRMED ACTIVE:**
- **Cerro Negro**: Moxico spent **$500K on target definition** (complete)
- **Cerro Negro Drilling**: 20,000m commitment, starts mid-2026
- **El Fierro**: Moxico must drill 10,000m + property payments for 51%
- **External validation**: Moxico is spending real money, not walking away

**STRATEGIC SHIFT:**
- **New focus**: Lower elevation projects (Zorro, Cerro Negro)
- **Benefits**: Year-round work, 50% lower costs, faster turnaround
- **Balance**: Still maintaining high-elevation projects (El Fierro, BC) but adding lower-cost options
- **Goal**: Multiple shots on goal with faster drill cycles

**BC PROJECTS UPDATE:**
- **Copper Queen**: Permitting underway, **drilling this summer 2026**
- **Copper Prince**: 9 months for permits (summer 2027)
- **Core Mountain**: Early stage, mapping this summer

**DON JULIO — PARTNER HUNT:**
- **Status**: Active discussions with multiple groups
- **Investment**: $18M already spent by Sable/South32
- **Targets**: Clear drill targets at Gringa-Morro transition zone
- **Potential**: Four porphyry centers identified, untested high-grade core

### 📧 CEO EMAIL - Ruben Padilla (March 15, 2026)
**Source**: Direct email from Ruben Padilla to Kevin

**EL FIERRO ASSAYS - TIMELINE CONFIRMED:**
- **4 drill holes** - final assays expected in **10-12 days** (received March 15)
- **Expected release**: March 25-27, 2026
- **Process**: Review with Moxico first, then press release
- **Purpose**: Understanding system geometry, footprint size, next drill hole placement
- **Next phase**: Northern and southern extensions (Q3-Q4 2026)

**Significance:**
- Confirms Q4 2025 assays are actively being processed (not lost/delayed)
- Moxico partnership actively engaged (reviewing results together)
- Catalyst now has concrete 7-9 day timeline
- Stock at C$0.06 with potential re-rate setup

### Sable Financial Position (VERIFIED - Feb 28, 2026)
**Source**: Jan 28, 2026 Corporate Outlook + Q4 2025 financials
- **Cash & Cash Equivalents**: **~C$17 million** (~$12.6M USD at 1.35 FX)
- **Date**: December 31, 2025 (end of fiscal 2025)
- **Cash/Market Cap Ratio**: **100%** at $17M market cap (exceptional)
- **Burn Rate**: Low (Moxico funds El Fierro drilling)
- **Runway**: **3+ years** without raise
- **2026 Budget**: ~$4M (Zorro + Copper Queen + overhead) — leaves $13M+ in bank

**Cash Build Sources (2025):**
- C$1.75M private placement with Moxico (July 2, 2025)
- Milestone payments from Moxico earn-in agreement
- Royalty sale proceeds (early 2025)
- Pending 2026 earn-in contributions included

**Key Insight**: Sable is **extremely well-funded**. $17M cash + Moxico partnership = zero financing risk through 2026 catalysts. They could drill Zorro, advance Don Julio, AND pursue BC projects without raising. This is a fortress balance sheet for a junior explorer.

### Daily Tracking Log — March 6, 2026 (9:03 AM ET)
**Source**: Daily Sable Resources monitoring

**News Scan (Past 7 Days):**
- ✅ **No new material news** found
- Most recent: Feb 25, 2026 — Zorro North discovery (already captured)
- No new GlobeNewswire releases
- No SEDAR+ filings
- No market-moving social media discussions

**Status**: Normal quiet period between catalysts. No action required.

---

### Daily Tracking Log — March 13, 2026 (9:00 AM ET)
**Source**: Daily Sable Resources monitoring

**Price Data (EODHD):**
- **Current Price**: $0.065 CAD (as of 7:27 AM ET)
- **Previous Close**: $0.07 CAD
- **Change**: -$0.005 (**-7.14%**)
- **Volume**: 89,000 shares
- **Status**: Down from Thursday close, still below trailing stop

**News Scan (Past 7 Days):**
- ✅ **No new material news** for Sable Resources (SAE.V)
- Web search returned articles about **Sable Offshore (SOC)** — different company (California oil producer)
- No new GlobeNewswire releases for Sable Resources
- No SEDAR+ filings
- No market-moving social media discussions

**Key Alerts:**
- 🔬 **El Fierro assays**: Still pending (Q4 2025 drilling complete, ~72 days overdue)
- ⛏️ **Zorro drilling**: Expected to commence in ~18 days (late Q2 2026)
- ⏳ **Awaiting**: CEO Ruben Padilla email response on assay timeline

**Status**: Normal quiet period. Stock down 7% this morning. No action required.

---

### 🚨 INSIDER ALERT — March 13, 2026 (4:37 PM ET)
**Source**: CEO.ca + SEDI (Canadian Insider Filing System)

**Insider Transaction — Guy Desharnais:**
- **March 12, 2026**: Purchased **100,000 shares**
- **March 13, 2026**: Purchased **100,000 shares**
- **Total Purchase**: **200,000 shares** over 2 days
- **Total Holdings**: **360,000 shares**
- **Estimated Investment**: ~$10,000 USD (at ~$0.05/share)

**Significance:**
- **62% of avg daily volume** (324k) — substantial accumulation
- **Insider buying at -38% lows** — strong confidence signal
- **Creates price floor** at $0.04-$0.05 level
- **Contrarian indicator** — management sees value at current prices

**Context:**
- Insider buying after trailing stop breach
- Ahead of Q4 2025 El Fierro assays (pending)
- Zorro drilling ~18 days out
- Combined with Kevin's 900k position = 1.26M shares aligned

**Action:** Bullish signal. Hold position. Insider support confirms floor.

---

### Personal Holdings - UPDATED (March 3, 2026)

**ACTIVE POSITIONS:**

**1. Sable Resources (SAE)**
- **Shares:** 900,000
- **Cost basis:** $0.07/share USD
- **Purchase Date:** February 15, 2026 (SHORT-TERM)
- **Current price:** $0.08/share CAD (as of Feb 23, 2026)
- **Position value:** $72,000 CAD (~$52,200 USD)
- **Tax Note:** Long-term eligible Feb 16, 2027

**2. Knightscope (KSCP)** ⭐ **NEW POSITION**
- **Shares:** 1,170
- **Cost basis:** $4.15/share USD
- **Purchase Date:** March 3, 2026
- **Position value:** ~$4,856 USD
- **Thesis:** AI/security robotics, Event Risk acquisition catalyst, 10x potential
- **Risk Level:** HIGH (speculative, unprofitable company)

**SOLD POSITIONS:**
- ~~**Pirate Gold (YARR.V)**~~ - **SOLD March 3, 2026**
  - Exited full position (21,450 shares)
  - Proceeds rotated into Knightscope

**3. Delta Air Lines (DAL) — NEW OPTIONS POSITION**
- **Contracts**: 13 × $70 Call Options
- **Expiration**: June 18, 2026
- **Premium**: $3.66/share ($4,758 total cost)
- **Breakeven**: $73.66
- **Purchase Date**: March 5, 2026
- **Thesis**: Contrarian play on oil price decline and Middle East tensions easing
- **Target**: $75 (+$1,742 profit at target)
- **Risk Level**: HIGH (options, time decay, geopolitical volatility)

**Portfolio Summary:**
- Total positions: 3 (Sable + Knightscope + Delta Options)
- Mining exposure: Sable (copper/gold)
- Tech exposure: Knightscope (AI/robotics)
- Options/Contrarian: Delta Airlines (airline/oil inverse play)
- Diversification: Added tech sector + options strategy

### 2026-02-20 Strategic Update - CORRECTED

**Critical Corrections from Previous Analysis:**

1. **South32 Terminated Don Julio** (July 28, 2025)
   - South32 walked away after 4 years and 12,717m drilling
   - Agreement terminated (not South32 funding as previously stated)
   - Sable now has 100% but NO external funding

2. **El Fierro Crown Jewel Status** (Feb 2025)
   - **Moxico Resources** signed Feb 27, 2025
   - **Moxico earns 51%** by funding 20,000m drilling + US$2.14M
   - **Sable receives US$150k/year** starting Year 2
   - **El Fierro is NOW the funded, advancing asset**
   - Pyros system: 142m @ 0.24% CuEq, 119m @ 0.22% CuEq

3. **Current Capital Allocation** (per Jan 2026 press release):
   - **El Fierro**: Partner-funded (Moxico), actively drilling
   - **Cerro Negro**: Partner-funded (Moxico), early exploration
   - **Zorro**: Self-funded, first drilling late Q2 2026
   - **Don Julio**: Care & maintenance, seeking partner
   - **BC Projects**: Copper Queen, Copper Prince (self-funded)

4. **Revised Crown Jewel**:
   - **#1: El Fierro** - Only project generating value (funded, advancing)
   - **#2: Don Julio** - Highest potential but stranded (need partner)
   - **#3: Zorro** - Cheap option with big upside

**Stock Performance:**
- Feb 8: $0.0548
- Feb 13: $0.08
- **+46% rally** - Market recognized Moxico partnership value

**Critical Dates:**
- ✅ ~~Feb 28, 2026: Zorro option payment deadline~~ [PAID - Feb 27, 2026]
- Late Q2 2026: Zorro first drilling (major catalyst)
- Ongoing: El Fierro drilling results

**Sources:**
1. [Sable Resources - Jan 2026 Corporate Outlook](https://sableresources.com/sable-advances-discovery-strategy-2025-milestones-and-2026-corporate-outlook/)
2. [South32 Termination - July 28, 2025](https://www.globenewswire.com/news-release/2025/07/28/3122330/0/en/Sable-Announces-Termination-of-Don-Julio-Project-Earn-in-Agreement-with-South32)
3. [Moxico Partnership - Feb 27, 2025](https://sableresources.com/sable-and-moxico-resources-sign-letter-agreement-for-the-el-fierro-project-and-the-cerro-negro-property-san-juan-province-argentina/)
4. Yahoo Finance (Feb 13, 2026)

*Last updated: 2026-02-20*  
*Analysis: sable_current_analysis_feb2026.md*

---

### 2026-02-28 Comprehensive Update

**Current Price**: EODHD shows $0.085 CAD (Feb 27 close)
**Conviction Level**: **9.2/10** (company-only, concentration risk removed per user direction)

#### Complete Project Portfolio Assessment

**ARGENTINA (San Juan) — Tier 1, World-Class** ✅
- **Geology**: Frontal Cordillera, extension of Chile's world-class copper belt
- **Jurisdiction**: Highest-ranked in Argentina (Fraser Institute 2024)
- **Proven Analogues**: Chita Valley (188 Mt @ 0.41% CuEq), Los Azules (top-25 global), Vicuña (world's largest Cu-Au-Ag) all on same trend

**Projects:**
- **El Fierro**: Partner-funded by Moxico (20,000m drilling), 51% earn-in, actively drilling
- **Zorro**: New discovery (Zorro North: 1.36% Cu over 700m x 550m), $1M/3yr option, Q2 2026 drilling
- **Don Julio**: 12,717m of South32 data, highest potential, seeking partner (care & maintenance)
- **Cerro Negro**: Partner-funded by Moxico, early exploration

**BC (Canada) — Tier 1 Jurisdiction, Early Stage**
- **Copper Queen** (15,133 ha): Copper-bearing breccias identified, VTEM completed
- **Copper Prince** (3,980 ha): Cu-Mo porphyry target defined
- **Rusty Peak** (1,942 ha): Early exploration
- **Verdict**: Good porphyry potential, years behind Argentina, stable Canadian jurisdiction

**MEXICO (Chihuahua) — Silver Focus, Early Copper**
- **Vinata**: First drill test initiated, geophysical surveys completed
- **El Escarpe**: Early stage exploration
- **Margarita**: Silver project (discovered 2018)
- **Size**: 1.6M ha regional program
- **Verdict**: Silver thesis primarily, copper potential unclear, massive land package

**Geological Ranking:**
1. **Argentina** — World-class copper geology, proven district, active drilling
2. **BC** — Good copper porphyry potential, early stage, stable jurisdiction
3. **Mexico** — Silver focus, early copper exploration, limited data

#### Investment Thesis Summary

**The Setup:**
- $17M cash = 100% of market cap (buying cash at par)
- Enterprise value ≈ $0 (geology is free)
- 3+ year runway, zero financing risk
- Moxico-funded drilling at El Fierro
- Zorro North discovery derisks cheap option
- Argentina projects = world-class real estate

**Key Catalysts (2026):**
- Q2: Zorro initial drilling
- Ongoing: El Fierro assays (overdue but funded)
- Potential: Don Julio partner announcement

**Why 9.2/10 (Not 10/10):**
- El Fierro assays 60+ days overdue (execution concern)
- Don Julio stranded (need partner)
- Argentina jurisdiction risk (manageable)
- Exploration risk (no guarantees)

**Bottom Line**: Buying $17M cash + world-class copper projects for $17M. Asymmetric value with near-zero downside.

---

## Knowledge Graph Integration (Active)

**Status**: ✅ Connected to knowledge graph (1,099+ entities, 18 relationships)
**Last Sync**: 2026-02-04

### Tracked Entities

**⭐ TOP_PICK**
- **Sable Resources** (SAE/SBLRF) - Junior copper miner in Argentina

**⭐ BIOTECH TOP_PICK**
- **AVXL** (Anavex Life Sciences) - Small-cap biotech, Alzheimer's/Rett/Parkinson's

**📊 Active Concepts**
- `drill catalysts` → affects Sable Resources
- `USA-Argentina deal` → affects Sable Resources (minerals agreement signed Feb 4, 2026)
- `jurisdictional risk` → risk factor
- `short candidates` → strategy
- `AI disruption` → affects Software sector
- `biotech 10x` → active research folder
- `EMA approval` → affects AVXL (re-examination requested Dec 2025)
- `SIGMAR1 biomarker` → AVXL precision medicine strategy
- `autophagy mechanism` → AVXL differentiated approach

**🔬 Research Coverage (Software Short Candidates)**
- ServiceNow (NOW) - YTD: -28%
- Salesforce (CRM) - YTD: -26%  
- Intuit (INTU) - YTD: -34%
- Snowflake (SNOW) - P/S: 82
- CrowdStrike (CRWD)
- MongoDB (MDB)
- Datadog (DDOG)
- Cloudflare (NET)
- Palantir (PLTR)

**🌍 Key Locations**
- Argentina - mining jurisdiction (Sable Resources)
- USA - primary market & AVXL location
- Canada - mining jurisdiction

**Query Method**: Knowledge graph can be queried via Python scripts in `knowledge/scripts/`
- `openclaw_integration.py` - Entity search and retrieval
- `retrieve.py` - Vector database search
- `ingest.py` - Add new information

*Integration active: I can now reference knowledge graph entities in responses*

---

## Knowledge Graph Workflow (Active Since Feb 28, 2026)

**Primary Rule**: Knowledge graph is the FIRST and PRIMARY memory system.

### Before Every Response:
1. **Query knowledge graph** for relevant entities (Sable, AVXL, etc.)
2. Check for prior learnings, corrections, established facts
3. Use KG data to inform response

### After Every Learning:
1. **Immediately update knowledge graph** with new information
2. Include: entities, relationships, attributes, source
3. Commit KG changes to git
4. Log to .learnings/LEARNINGS.md (secondary)

### Priority Hierarchy:
1. **Knowledge Graph** (operational truth)
2. **MEMORY.md** (curated long-term reference)
3. **memory/YYYY-MM-DD.md** (daily logs)
4. **Session context** (current conversation)

**Trigger**: Any correction, update, or new fact → Immediate KG ingestion

---

## OreTracker Architecture & Fixes (2026-03-01)

**Critical Fixes Applied:**

### 1. Backend Duplicate Endpoint (Fixed)
- **Issue**: `/api/prices/{symbol}` defined in both `main.py` and `price_api.py`
- **Impact**: History data not returned
- **Fix**: Removed duplicate from `main.py`
- **Location**: Lines 131-145 in main.py

### 2. Cache Key Collision (Fixed)
- **Issue**: Both endpoints used same cache key `f"price_{symbol}"`
- **Impact**: Batch endpoint cached data without history
- **Fix**: GET endpoint now uses `f"price_with_history_{symbol}"`
- **File**: `/backend/price_api.py`

### 3. Batch Endpoint History (Fixed)
- **Issue**: Batch endpoint only fetched 1 day of data
- **Impact**: No historical data for charts
- **Fix**: Updated to fetch 1 year with full history extraction
- **File**: `/backend/price_api.py`

**Documentation Created:**
- `/docs/ARCHITECTURE.md` - Full system architecture
- `/docs/TICKER_ONBOARDING.md` - Guide for adding new tickers

**Key Technical Details:**
- Backend: FastAPI with Yahoo Finance API integration
- Frontend: React + Chart.js
- Cache: 5-minute duration
- History: 251-252 days of OHLC data per ticker
- Symbols supported: TSX (.TO), TSXV (.V), NYSE, NASDAQ, OTC

---

## Self-Improving Memory System (Active Since Feb 25, 2026)

**Overview**: Structured learning capture system for continuous improvement based on [self-improving-agent skill](https://playbooks.com/skills/openclaw/skills/self-improving-agent).

**Location**: `.learnings/` directory

**Files**:
- `ERRORS.md` — Command failures, API errors, integration issues
- `LEARNINGS.md` — User corrections, knowledge gaps, best practices
- `FEATURE_REQUESTS.md` — Missing capabilities & user requests
- `README.md` — System documentation

**Workflow**:
1. **Capture** → Log events immediately when they happen
2. **Categorize** → Use appropriate tags/categories
3. **Review** → During heartbeat maintenance, review recent entries
4. **Promote** → Move important learnings to project memory files

**Active Patterns**:
- `press-release-interpretation` — Ambiguous language in announcements
- `deadline-tracking` — Catalyst countdown accuracy
- `cron-job-monitoring` — Automated system health checks

**Review Cadence**:
- Daily: Quick scan during heartbeats
- Weekly: Promote important learnings (Mondays)
- Monthly: Consolidate patterns, archive old entries

**Last Learning Logged**: 2026-02-25 — Zorro option agreement ambiguity (press-release-interpretation pattern)

<!-- KG_AUTO_START -->
### Sable Projects (Auto-Generated from KG)
| Project | Type | Status | Catalyst |
|---------|------|--------|----------|
| Don Julio Project | N/A | Care and Maintenance | N/A |
| El Fierro Project | Cu-Au-Mo Porphyry | Assays Released | Results published March 2026 |
| Zorro Project | N/A | N/A | Drilling Q2 2026 |

### Company Financials (Auto-Generated from KG)
- **Sable Resources Ltd**:
  - Market Cap: C$25.6M
  - Cash: C$17.0M
  - Shares: 320.2M
- **Moxico Resources**:
- **Knightscope Inc**:
- **Minsud Resources**:
- **NGEX Minerals**:
- **Challenger Gold**:

### Position Tracking (Auto-Generated from KG)
- **Kevin Sable Position**:
  - Shares: 900,000
  - Cost Basis: $0.07
  - Invested: $63,000
  - Current Value: $45,000
  - P&L: $-18,000
- **Delta Airlines Options**:
  - Shares: 0
  - Cost Basis: $0.00
  - Invested: $0
  - Current Value: $0
  - P&L: $+0

### Upcoming Catalysts (Auto-Generated from KG)
- **El Fierro Project**: Results published March 2026
- **Zorro Project**: Drilling Q2 2026
<!-- KG_AUTO_END -->