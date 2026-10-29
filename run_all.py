"""Runs every scenario and farmer type (healthy soil and problem soil) and writes results/summary.csv."""
import csv, os, model
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(root, 'results', 'summary.csv'), 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['scenario', 'soil', 'farmer', 'irrigations', 'water_mm', 'drained_mm', 'stress_days', 'crop_yield_pct', 'income_after_water_device_inr_per_acre'])
    for soil_name, soil in (('healthy pH6.8 EC0.5', dict(pH=6.8, ec=0.5)), ('acidic+salty pH5.2 EC3.0', dict(pH=5.2, ec=3.0))):
        for k in model.SCENARIOS:
            for t in model.TIERS:
                s = model.summary(model.farm(k, t, {}, soil, {}))
                w.writerow([k, soil_name, t, s['irrigations'], s['waterUsed'], round(s['drained'], 1), s['stressDays'], round(s['yieldTotal'] * 100, 1), round(s['net'])])
print('wrote results/summary.csv')
