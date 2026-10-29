# Krishi-Rakshak: concept simulator (v2)

**Same field. Same sky. Four farmers.** A runnable simulation comparing four farmers under identical weather and water:

| Farmer | Tool |
|---|---|
| Ramu | No forecast: routine irrigation, guesses the sky |
| Sunita | Mobile weather forecast (district-level) |
| Vijay | Commercial sensor kit + app |
| Anand | Krishi-Rakshak: soil probes, symbols and Marathi voice, offline |

It reports **plant growth** (crop yield proxy), **farmer income** (after water and device costs) and a **national food-security** scaling, with separate views for water, rain alert, heat, drought, soil pH, water quality, and everything together.

> **Honest status: concept, not prototype.** Everything is a model with stated assumptions, not measured field data. Figures tagged "source" in the page link to official or news sources; everything else is an assumption in `model.js`.

**Live demo:** push to GitHub, enable Pages (Settings > Pages > `main` / root), open `index.html`. Deep links: `?s=drought|normal|storm|heat`, `&bad=1` (acidic, salty soil), `&tab=all|water|rain|heat|drought|ph|ec`.

## What the model says (and does not)
- Most of the gain comes from **soil-based irrigation timing**. The phone forecast alone barely changes outcomes.
- Vijay's kit does the same irrigation job as Anand's station. Anand's edge in this model is **cost**, **offline voice use** (assumed higher follow-through), and the **pH check** (assumed). These are assumptions to test in a pilot.
- On healthy soil in a normal year, income barely moves. The tools pay off in **drought, heat and bad soil**.
- The rain alert adds a small gain, and its real skill is unvalidated.

## Sourced inputs
Maharashtra drought in 265 of 358 talukas (All India Radio, Sept 2026); 86.21% small/marginal holdings (Agriculture Census 2015-16); ₹3,798/month net cultivation income per farm household (NSS 77th round); 7.98% of net sown area under micro-irrigation (PIB, June 2026); soil-health testing: 8-10% less fertiliser, 5-6% yield (NPC study, PIB); 353.96 Mt foodgrain 2024-25 (third advance estimate); Fasal kit ₹20,000+ and ₹500-700/month (Inc42, 2020, may be outdated); 130 agromet units, district/block 5-day forecasts (MoES, 2025); 2.7 Mha saline and 3.7 Mha alkaline soils (Lok Sabha, ICAR 2010). Links are in the page's Sources section.

## Model
Daily soil-water bucket: `S(t+1) = S + 0.9 x rain + irrigation - ET x Ks`. Yield = water factor x pH factor x salinity factor. Income = revenue - pumping - device - soil amendments. Scale = yield difference x farmers x acres x tonnes per acre.

## Run
```
python3 python/run_all.py      # results/summary.csv
python3 tests/test_parity.py   # Python and JavaScript give identical numbers (needs Node)
```

## Concept to proof of concept
1. Bench-calibrate capacitive probes against oven-dry soil samples. 2. Breadboard ESP32 + probes + tipping-bucket rain gauge on one plot for 4-6 weeks. 3. Compare with the nearest government station. 4. Replace assumptions (thresholds, follow-through, rain-alert skill) with measured values. 5. Paper-prototype test of symbols and voice with 15-20 farmers. 6. Small cluster pilot against matched plots.

## Limits
One-crop, one-soil bucket; scripted rain; round ET numbers; assumed revenue per acre, costs and yield penalties; the water-test (EC) probe is a proposed add-on, not in the current design.
