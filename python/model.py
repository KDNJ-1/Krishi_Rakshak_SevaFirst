"""Krishi-Rakshak concept simulator v2 (Python mirror of model.js). Illustrative, NOT measured data."""
import copy
P = dict(DAYS=90, AWC=100, CRIT=35, TRIGGER=50, WATCH=65, HOLD_MIN=40, IRR=40, RAIN_EFF=0.9, INTERVAL=8, SKIP=10, LPA=4046.86)
TIERS = ['none', 'forecast', 'kit', 'ours']
DEFAULTS = dict(cfg=dict(fcRel=.55, stationRel=.55, fcFalse=.15, kitUse=.5, ourUse=.9), soil=dict(pH=8.0, ec=2.0),
    econ=dict(revenueAcre=50000, priceMult=1.0, pumpPerMm=20, kitCostYr=10000, ourCostYr=4100, kitHasPH=False, ourHasEC=True, phAmend=1500, ecManage=500, phCorr=.8, ecCut=.4),
    scale=dict(farmers=100000, acres=2.5, tPerAcre=2.0, kgPerPerson=150))
hashA = lambda d: ((d * 37 + 11) % 100) / 100
hashB = lambda d: ((d * 53 + 29) % 100) / 100
SCENARIOS = {
 'normal': dict(events={5:(25,.3),14:(40,.2),26:(15,.6),38:(30,.4),55:(35,.3),70:(20,.7),82:(25,.5)}, fal=[47], et=lambda d: 3.8 if d<25 else 5.0 if d<65 else 4.2, start=4, budget=12, s0=70),
 'drought': dict(events={3:(30,.3),9:(20,.4),58:(30,.3),75:(20,.5)}, fal=[], et=lambda d: 3.8 if d<25 else 5.2 if d<65 else 4.4, start=6, budget=7, s0=60),
 'storm': dict(events={6:(20,.9),22:(15,.5),31:(70,.2),32:(30,-1),50:(25,.7),68:(30,.4)}, fal=[40], et=lambda d: 3.8 if d<25 else 5.0 if d<65 else 4.2, start=6, budget=12, s0=70),
 'heat': dict(events={8:(25,.3),30:(20,.4),62:(30,.3),80:(20,.5)}, fal=[], et=lambda d: 7.5 if 35<=d<=46 else (3.8 if d<25 else 4.6), start=6, budget=12, s0=70),
}
def _m(base, over):
    r = copy.deepcopy(base); r.update(over or {}); return r

def simulate(key, tier, cfg=None):
    cfg = _m(DEFAULTS['cfg'], cfg); sc = SCENARIOS[key]; D = P['DAYS']
    rain = [0.0]*(D+1); et = [0.0]*(D+1); detFc = [False]*(D+1); detSt = [False]*(D+1)
    for d in range(1, D+1): et[d] = sc['et'](d)
    for d, (mm, u) in sc['events'].items():
        rain[d] = mm
        if u >= 0 and u < cfg['fcRel']: detFc[d] = True
        if u >= 0 and u < cfg['stationRel']: detSt[d] = True
    fal = [False]*(D+1)
    for d in sc['fal']: fal[d] = True
    S = float(sc['s0']); budget = sc['budget']; pending = False
    o = dict(drained=0.0, eta=0.0, etc=0.0, stress=0, irrigations=0)
    for d in range(1, D+1):
        morning = S; rainedY = d > 1 and rain[d-1] >= P['SKIP']; irrigate = False
        def routine(blocked):
            nonlocal pending, irrigate
            due = (d >= sc['start'] and (d-sc['start']) % P['INTERVAL'] == 0) or pending
            if not due: return
            if rainedY or blocked: pending = True
            elif budget > 0: irrigate = True; pending = False
        def threshold(signal):
            nonlocal irrigate
            if signal and morning >= P['HOLD_MIN']: return
            if morning <= P['TRIGGER'] and budget > 0: irrigate = True
        if tier == 'none': routine(False)
        elif tier == 'forecast': routine(detFc[d] or hashA(d) < cfg['fcFalse'])
        elif tier == 'kit':
            if hashB(d) < cfg['kitUse']: threshold(detFc[d] or hashA(d) < cfg['fcFalse'])
            else: routine(False)
        else:
            if hashB(d) < cfg['ourUse']: threshold(detSt[d] or fal[d])
            else: routine(False)
        add = 0
        if irrigate: add = P['IRR']; budget -= 1; o['irrigations'] += 1
        S = S + P['RAIN_EFF']*rain[d] + add
        if S > P['AWC']: o['drained'] += S-P['AWC']; S = P['AWC']
        ks = 1.0 if S >= P['CRIT'] else S/P['CRIT']; eta = et[d]*ks
        o['etc'] += et[d]; o['eta'] += eta; S = max(0.0, S-eta)
        if S < P['CRIT']: o['stress'] += 1
    o['yieldWater'] = o['eta']/o['etc']; o['waterUsed'] = o['irrigations']*P['IRR']; return o

def phFactor(pH):
    if 6.0 <= pH <= 7.5: return 1.0
    return max(0.6, 1-0.25*(pH-7.5)) if pH > 7.5 else max(0.6, 1-0.2*(6.0-pH))
def ecFactor(ec): return 1 - min(0.6, max(0.0, ec-1.5)*0.10)

def farm(key, tier, cfg=None, soil=None, econ=None):
    cfg = _m(DEFAULTS['cfg'], cfg); soil = _m(DEFAULTS['soil'], soil); econ = _m(DEFAULTS['econ'], econ)
    w = simulate(key, tier, cfg)
    knowsPH = tier == 'ours' or (tier == 'kit' and econ['kitHasPH']); knowsEC = tier == 'ours' and econ['ourHasEC']
    pH, ec, amend = soil['pH'], soil['ec'], 0
    if knowsPH:
        dev = pH-7.0; step = min(abs(dev), econ['phCorr'])
        if abs(dev) > 0.2 and phFactor(pH) < 1:
            pH = pH-(1 if dev > 0 else -1)*step; amend += econ['phAmend']
    if knowsEC and ec > 1.5: ec = ec*(1-econ['ecCut']); amend += econ['ecManage']
    yt = w['yieldWater']*phFactor(pH)*ecFactor(ec)
    revenue = econ['revenueAcre']*econ['priceMult']*yt; pump = w['waterUsed']*econ['pumpPerMm']
    tool = econ['kitCostYr'] if tier == 'kit' else econ['ourCostYr'] if tier == 'ours' else 0
    return dict(water=w, yieldTotal=yt, net=revenue-pump-tool-amend)

def summary(f):
    w = f['water']
    return dict(irrigations=w['irrigations'], waterUsed=w['waterUsed'], drained=round(w['drained'], 6), stressDays=w['stress'],
                yieldWater=round(w['yieldWater'], 6), yieldTotal=round(f['yieldTotal'], 6), net=round(f['net'], 4))
