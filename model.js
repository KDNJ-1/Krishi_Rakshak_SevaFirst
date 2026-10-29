/* Krishi-Rakshak concept simulator v2. Illustrative assumptions, NOT measured data.
   Four farmers, same field, same sky: none | forecast | kit | ours.
   Mirrored in python/model.py; tests/test_parity.py checks both give identical numbers. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KR = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const P = { DAYS: 90, AWC: 100, CRIT: 35, TRIGGER: 50, WATCH: 65, HOLD_MIN: 40, IRR: 40, RAIN_EFF: 0.9,
              INTERVAL: 8, SKIP_IF_RAIN_YESTERDAY: 10, MM_TO_LITRES_PER_ACRE: 4046.86 };
  const TIERS = ['none', 'forecast', 'kit', 'ours'];
  const DEFAULTS = {
    cfg:  { fcRel: 0.55, stationRel: 0.55, fcFalse: 0.15, kitUse: 0.5, ourUse: 0.9 },
    soil: { pH: 8.0, ec: 2.0 },
    econ: { revenueAcre: 50000, priceMult: 1.0, pumpPerMm: 20, kitCostYr: 10000, ourCostYr: 4100, kitHasPH: false, ourHasEC: true,
            phAmend: 1500, ecManage: 500, phCorr: 0.8, ecCut: 0.4 },
    scale: { farmers: 100000, acres: 2.5, tPerAcre: 2.0, kgPerPerson: 150 }
  };
  const hashA = d => ((d * 37 + 11) % 100) / 100, hashB = d => ((d * 53 + 29) % 100) / 100;

  // events: day -> [rain_mm, detectU]; a signal fires if detectU < reliability
  const SCENARIOS = {
    normal:  { title: 'Normal season', blurb: 'Scattered rain through the season.',
      events: { 5: [25, .3], 14: [40, .2], 26: [15, .6], 38: [30, .4], 55: [35, .3], 70: [20, .7], 82: [25, .5] },
      falseAlarms: [47], et: d => d < 25 ? 3.8 : d < 65 ? 5.0 : 4.2, start: 4, budget: 12, s0: 70 },
    drought: { title: 'Drought spell (limited water)', blurb: 'A long dry spell and only 7 irrigations of water (borewell or tank).',
      events: { 3: [30, .3], 9: [20, .4], 58: [30, .3], 75: [20, .5] },
      falseAlarms: [], et: d => d < 25 ? 3.8 : d < 65 ? 5.2 : 4.4, start: 6, budget: 7, s0: 60 },
    storm:   { title: 'Heavy rain on the way', blurb: 'A 70 mm storm arrives right after a routine irrigation day.',
      events: { 6: [20, .9], 22: [15, .5], 31: [70, .2], 32: [30, -1], 50: [25, .7], 68: [30, .4] },
      falseAlarms: [40], et: d => d < 25 ? 3.8 : d < 65 ? 5.0 : 4.2, start: 6, budget: 12, s0: 70 },
    heat:    { title: 'Heat wave', blurb: 'Twelve very hot days (ET about 7.5 mm/day) in mid-season.',
      events: { 8: [25, .3], 30: [20, .4], 62: [30, .3], 80: [20, .5] },
      falseAlarms: [], et: d => (d >= 35 && d <= 46) ? 7.5 : (d < 25 ? 3.8 : 4.6), start: 6, budget: 12, s0: 70 }
  };

  function simulate(key, tier, cfg) {
    cfg = Object.assign({}, DEFAULTS.cfg, cfg || {});
    const sc = SCENARIOS[key], D = P.DAYS;
    const rain = new Array(D + 1).fill(0), et = new Array(D + 1).fill(0);
    const detFc = new Array(D + 1).fill(false), detSt = new Array(D + 1).fill(false);
    for (let d = 1; d <= D; d++) et[d] = sc.et(d);
    Object.keys(sc.events).forEach(k => { const e = sc.sorted = sc.events[k]; rain[+k] = e[0];
      if (e[1] >= 0 && e[1] < cfg.fcRel) detFc[+k] = true; if (e[1] >= 0 && e[1] < cfg.stationRel) detSt[+k] = true; });
    const fal = new Array(D + 1).fill(false); sc.falseAlarms.forEach(d => fal[d] = true);
    let S = sc.s0, budget = sc.budget, pending = false;
    const o = { tier, S: [S], rain, irrigation: new Array(D + 1).fill(0), events: [], drained: 0, eta: 0, etc: 0, stress: 0, irrigations: 0 };
    for (let d = 1; d <= D; d++) {
      const morning = S, rainedY = d > 1 && rain[d - 1] >= P.SKIP_IF_RAIN_YESTERDAY;
      let irrigate = false;
      const routine = (blockedExtra, why) => {
        const due = (d >= sc.start && (d - sc.start) % P.INTERVAL === 0) || pending;
        if (!due) return;
        if (rainedY || blockedExtra) { pending = true; o.events.push([d, 'skip', rainedY ? 'Routine irrigation skipped: it rained yesterday' : why]); }
        else if (budget > 0) { irrigate = true; pending = false; o.events.push([d, 'irrigate', 'Routine irrigation']); }
      };
      const threshold = (signal, label) => {
        if (signal && morning >= P.HOLD_MIN) { o.events.push([d, 'hold', label + ': rain expected, irrigation held (soil ' + Math.round(morning) + ' mm)']); }
        else if (morning <= P.TRIGGER && budget > 0) { irrigate = true; o.events.push([d, 'irrigate', 'Soil at ' + Math.round(morning) + ' mm: irrigate now']); }
        else if (morning <= P.TRIGGER) o.events.push([d, 'dry', 'Soil dry, but no water left']);
      };
      if (tier === 'none') routine(false, '');
      else if (tier === 'forecast') routine(detFc[d] || hashA(d) < cfg.fcFalse, 'Phone forecast said rain: irrigation skipped');
      else if (tier === 'kit') { if (hashB(d) < cfg.kitUse) threshold(detFc[d] || hashA(d) < cfg.fcFalse, 'Kit app'); else routine(false, ''); }
      else { if (hashB(d) < cfg.ourUse) threshold(detSt[d] || fal[d], 'Station'); else routine(false, ''); }
      let add = 0; if (irrigate) { add = P.IRR; budget--; o.irrigations++; o.irrigation[d] = P.IRR; }
      S = S + P.RAIN_EFF * rain[d] + add;
      if (S > P.AWC) { o.drained += S - P.AWC; S = P.AWC; }
      const ks = S >= P.CRIT ? 1 : S / P.CRIT, eta = et[d] * ks;
      o.etc += et[d]; o.eta += eta; S = Math.max(0, S - eta); if (S < P.CRIT) o.stress++; o.S.push(S);
    }
    o.yieldWater = o.eta / o.etc; o.waterUsed = o.irrigations * P.IRR; return o;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function phFactor(pH) { if (pH >= 6.0 && pH <= 7.5) return 1; if (pH > 7.5) return Math.max(0.6, 1 - 0.25 * (pH - 7.5)); return Math.max(0.6, 1 - 0.2 * (6.0 - pH)); }
  function ecFactor(ec) { return 1 - Math.min(0.6, Math.max(0, ec - 1.5) * 0.10); }
  function farm(key, tier, cfg, soil, econ) {
    cfg = Object.assign({}, DEFAULTS.cfg, cfg || {}); soil = Object.assign({}, DEFAULTS.soil, soil || {}); econ = Object.assign({}, DEFAULTS.econ, econ || {});
    const w = simulate(key, tier, cfg);
    const knowsPH = tier === 'ours' || (tier === 'kit' && econ.kitHasPH), knowsEC = tier === 'ours' && econ.ourHasEC;
    let pH = soil.pH, ec = soil.ec, amend = 0;
    if (knowsPH) { const dev = pH - 7.0, step = Math.min(Math.abs(dev), econ.phCorr); if (Math.abs(dev) > 0.2 && phFactor(pH) < 1) { pH = pH - Math.sign(dev) * step; amend += econ.phAmend; } }
    if (knowsEC && ec > 1.5) { ec = ec * (1 - econ.ecCut); amend += econ.ecManage; }
    const fPH = phFactor(pH), fEC = ecFactor(ec), yieldTotal = w.yieldWater * fPH * fEC;
    const revenue = econ.revenueAcre * econ.priceMult * yieldTotal, pump = w.waterUsed * econ.pumpPerMm;
    const tool = tier === 'kit' ? econ.kitCostYr : tier === 'ours' ? econ.ourCostYr : 0;
    return { water: w, knowsPH, knowsEC, pHeff: pH, ecEff: ec, fPH, fEC, yieldTotal, revenue, pump, tool, amend, net: revenue - pump - tool - amend };
  }
  function scale(key, cfg, soil, econ, sc) {
    sc = Object.assign({}, DEFAULTS.scale, sc || {}); const res = {}, base = farm(key, 'none', cfg, soil, econ), acres = sc.farmers * sc.acres;
    TIERS.forEach(t => { const f = farm(key, t, cfg, soil, econ);
      const dT = (f.yieldTotal - base.yieldTotal) * sc.tPerAcre * acres;
      res[t] = { tonnes: dT, people: dT * 1000 / sc.kgPerPerson, waterML: (base.water.waterUsed - f.water.waterUsed) * P.MM_TO_LITRES_PER_ACRE * acres / 1e6,
                 incomeCr: (f.net - base.net) * sc.farmers / 1e7 }; });
    return res;
  }
  function summary(f) { return { irrigations: f.water.irrigations, waterUsed: f.water.waterUsed, drained: +f.water.drained.toFixed(6), stressDays: f.water.stress,
      yieldWater: +f.water.yieldWater.toFixed(6), yieldTotal: +f.yieldTotal.toFixed(6), net: +f.net.toFixed(4) }; }
  return { P, TIERS, DEFAULTS, SCENARIOS, simulate, farm, scale, phFactor, ecFactor, summary };
});
