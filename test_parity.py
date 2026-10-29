"""Checks Python and JavaScript models give identical numbers.  Run: python3 tests/test_parity.py (needs Node.js)"""
import json, subprocess, sys, os
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
sys.path.insert(0, os.path.join(root, 'python')); import model
CASES = [({}, {}, {}), ({'stationRel': .9, 'kitUse': .2, 'ourUse': .6}, {'pH': 5.2, 'ec': 3.1}, {'priceMult': 1.5, 'kitHasPH': True})]
js = """const KR=require('./model.js');const C=%s;const out=[];
for(const [cfg,soil,econ] of C)for(const k of Object.keys(KR.SCENARIOS))for(const t of KR.TIERS)out.push(KR.summary(KR.farm(k,t,cfg,soil,econ)));
console.log(JSON.stringify(out));""" % json.dumps(CASES)
res = json.loads(subprocess.check_output(['node', '-e', js], cwd=root)); bad = 0; i = 0
for cfg, soil, econ in CASES:
    for k in model.SCENARIOS:
        for t in model.TIERS:
            a = model.summary(model.farm(k, t, cfg, soil, econ)); b = res[i]; i += 1
            for f in a:
                if abs(a[f]-b[f]) > 1e-3: bad += 1; print('MISMATCH', k, t, f, a[f], b[f])
print('parity OK (%d cases)' % i if not bad else '%d mismatches' % bad); sys.exit(1 if bad else 0)
