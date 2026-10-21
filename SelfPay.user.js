// ==UserScript==
// @name        Self Pay Charges Auto Override
// @namespace   Violentmonkey Scripts
// @icon        https://usfas.modmedapp.com/ema/static/images/favicon.ico
// @version     1.1.0
// @description  Clicks Override Bill and applies price map only if Provider Fee Schedule is set to Self Pay Fee Schedule Oct 2025, skipping if already overridden unless new CPT codes are detected.
// @match       https://usfas.modmedapp.com/ema/web/practice/staff/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
 
(function() {
    'use strict';
 
    // CPT Code to Charge Map
    const CHARGE_MAP = {
        '10061': '200.00', '10120': '100.00', '10121': '200.00', '10140': '200.00',
        '10160': '100.00', '11042': '130.00', '11043': '100.00', '11044': '150.00',
        '11045': '75.00',  '11046': '0.00',   '11047': '0.00',   '11055': '0.00',
        '11056': '75.00',  '11057': '157.72', '11100': '203.24', '11101': '63.36',
        '11104': '200.00', '11300': '192.92', '11301': '235.02', '11305': '203.76',
        '11306': '238.66', '11307': '279.24', '11400': '242.82', '11401': '296.60',
        '11402': '329.18', '11403': '380.36', '11420': '245.48', '11421': '309.94',
        '11422': '348.64', '11423': '396.92', '11426': '658.60', '11600': '382.20',
        '11601': '445.00', '11603': '547.26', '11620': '384.14', '11621': '446.94',
        '11719': '27.58',  '11720': '63.66',  '11721': '88.70',  '11730': '250.00',
        '11732': '63.78',  '11740': '1035.52','11750': '250.00', '11755': '238.12',
        '11900': '106.72', '12001': '175.52', '12002': '215.14', '12020': '572.66',
        '12031': '488.16', '12032': '585.98', '12041': '489.88', '13160': '1578.36',
        '14040': '1478.10','15002': '684.40', '15004': '783.32', '15271': '292.68',
        '15273': '609.26', '15275': '307.60', '15277': '668.64', '17000': '126.52',
        '17003': '11.62',  '17110': '150.00', '17111': '0.00',   '17250': '163.84',
        '20005': '610.54', '20225': '809.66', '20550': '60.00',  '20551': '60.00',
        '20552': '60.00',  '20600': '50.00',  '20604': '590.00', '20605': '124.00',
        '20606': '124.00', '20612': '120.56', '20670': '712.40', '20680': '1198.38',
        '20690': '1179.68','20694': '834.32', '20900': '790.14', '27603': '1043.36',
        '27613': '492.38', '27630': '1077.50','27650': '1300.98','27654': '1420.00',
        '27658': '736.10', '27659': '0.00',   '27664': '711.68', '27685': '1299.44',
        '27687': '904.40', '27695': '968.58', '27698': '1264.58','27703': '2077.70',
        '27750': '674.38', '27752': '1051.28','27760': '650.96', '27762': '938.32',
        '27786': '613.32', '27788': '832.20', '27808': '650.72', '27810': '918.88',
        '27816': '636.82', '27818': '954.24', '27829': '1406.70','28001': '551.72',
        '28002': '876.52', '28010': '460.72', '28011': '626.82', '28020': '985.00',
        '28035': '2047.00','28039': '979.30', '28043': '775.80', '28045': '687.62',
        '28047': '2075.20','28060': '1019.66','28080': '1037.42','28090': '921.98',
        '28108': '325.00', '28110': '910.28', '28112': '0.00',   '28113': '1160.50',
        '28118': '1183.74','28119': '1035.64','28120': '1336.06','28122': '1177.98',
        '28124': '946.12', '28126': '774.02', '28153': '814.72', '28160': '819.16',
        '28200': '973.34', '28208': '949.36', '28220': '0.00',   '28232': '758.84',
        '28234': '806.28', '28238': '0.00',   '28250': '1145.38','28270': '972.42',
        '28272': '771.10', '28285': '1060.52','28288': '1256.38','28289': '1598.60',
        '28291': '1353.64','28292': '1018.04','28295': '1000.00','28296': '1959.58',
        '28297': '1759.58','28298': '1660.40','28299': '1246.34','28307': '1194.88',
        '28308': '1122.84','28310': '1080.16','28313': '1033.90','28315': '951.96',
        '28400': '482.98', '28405': '762.40', '28430': '466.66', '28435': '711.54',
        '28450': '414.22', '28470': '426.72', '28475': '505.32', '28476': '719.92',
        '28485': '1092.74','28490': '277.12', '28495': '348.46', '28510': '237.22',
        '28515': '319.12', '28530': '225.76', '28540': '382.72', '28555': '0.00',
        '28630': '306.86', '28635': '345.34', '28660': '233.16', '28665': '303.36',
        '28675': '1122.50','28730': '1457.46','28740': '1655.80','28750': '1572.18',
        '28760': '1547.28','28805': '1442.88','28810': '850.42', '28820': '1101.58',
        '28825': '1052.90','29405': '154.24', '29425': '148.34', '29445': '255.96',
        '29515': '138.32', '29540': '55.96',  '29550': '37.26',  '29580': '122.60',
        '29581': '173.28', '29799': '0.00',   '29893': '1254.52','29898': '1117.40',
        '36415': '0.00',   '64450': '90.00',  '64455': '95.68',  '64632': '172.90',
        '64640': '481.00', '64722': '0.00',   '73600': '60.30',  '73610': '66.40',
        '73620': '50.00',  '73630': '75.00',  '73650': '75.00',  '76881': '149.82',
        '76882': '110.18', '76942': '111.64', '93923': '252.46', '97033': '40.80',
        '97035': '28.46',  '97110': '60.42',  '97112': '69.40',  '97116': '59.76',
        '97140': '55.62',  '97161': '168.56', '97162': '168.56', '97163': '168.56',
        '97530': '77.16',  '97597': '187.00', '97598': '75.00',  '97605': '0.00',
        '97750': '0.00',   '99201': '0.00',   '99202': '140.00', '99203': '150.00',
        '99204': '200.00', '99211': '100.00', '99212': '100.00', '99213': '100.00',
        '99214': '100.00', '99242': '0.00',   '99243': '0.00',   'A5500': '150.00',
        'A5512': '52.00',  'A5513': '86.00',  'A5514': '86.00',  'A6212': '65.00',
        'E0114': '0.00',   'G0127': '0.00',   'J0702': '0.00',   'J1030': '0.00',
        'J1100': '0.00',   'J3301': '0.00',   'L1902': '87.00',  'L1906': '60.00',
        'L1907': '100.00', 'L1932': '100.00', 'L1940': '475.00', 'L1951': '825.00',
        'L1960': '65.00',  'L1970': '500.00', 'L1971': '175.00', 'L2210': '22.50',
        'L2275': '0.00',   'L2330': '250.00', 'L2820': '100.00', 'L3000': '312.50',
        'L3010': '220.50', 'L3260': '30.00',  'L4210': '75.00',  'L4350': '100.00',
        'L4360': '225.00', 'L4361': '225.00', 'L4387': '150.00', 'L4396': '180.00',
        'L4397': '60.00',  'L5000': '450.00', 'Q4038': '82.00',  'Q4131': '300.00',
        'Q4180': '344.50', 'S0395': '40.00'
    };
 
    let hasClicked = false;
    let hasOverridden = false;
 
    function isSelfPayFeeSchedule(doc) {
        return doc.body && doc.body.innerText.includes('Self Pay Fee Schedule Oct 2025');
    }
 
    function isAlreadyOverridden(doc) {
        return doc.body && doc.body.innerText.includes('This bill has been overridden');
    }
 
    // Checks if any CPT listed on the page does NOT match the expected mapped price
    function hasUnprocessedCPTCodes(doc) {
        const rows = Array.from(doc.querySelectorAll('table tbody tr'));
 
        return rows.some(row => {
            const rowText = row.innerText || '';
 
            // Check row against mapped CPT keys
            for (const cpt in CHARGE_MAP) {
                if (rowText.includes(cpt)) {
                    const expectedPrice = CHARGE_MAP[cpt];
                    // If row lacks the mapped target price, it is an unprocessed code
                    if (!rowText.includes(`$${expectedPrice}`)) {
                        return true;
                    }
                }
            }
            return false;
        });
    }
 
    function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
        const prototypeSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;
 
        if (prototypeSetter && valueSetter !== prototypeSetter) {
            prototypeSetter.call(element, value);
        } else if (valueSetter) {
            valueSetter.call(element, value);
        } else {
            element.value = value;
        }
    }
 
    function triggerClick(element) {
        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
            element.dispatchEvent(new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        });
    }
 
    function clickOverrideButton(doc) {
        const buttons = Array.from(doc.querySelectorAll('button, input[type="button"], input[type="submit"], a.btn'));
        const overrideBtn = buttons.find(btn => btn.textContent.trim().includes('Override Code') || btn.value?.includes('Override Code'));
 
        if (overrideBtn) {
            overrideBtn.click();
            hasOverridden = true;
        }
    }
 
    function attemptOverride(doc) {
        if (hasClicked || !isSelfPayFeeSchedule(doc)) return;
 
        // Support both initial override and editing an existing override when new charges appear
        const overrideBtn = doc.querySelector('[data-identifier="visitOverviewOverrideBillButton"]') ||
                            Array.from(doc.querySelectorAll('a, span, button')).find(
                                el => el.textContent.trim() === 'Override Bill' || el.textContent.trim() === 'Edit Overridden Bill'
                            );
 
        if (overrideBtn) {
            hasClicked = true;
            overrideBtn.focus();
            triggerClick(overrideBtn);
        }
    }
 
    function processDocument(doc) {
        if (hasOverridden || !isSelfPayFeeSchedule(doc)) return;
 
        const rows = doc.querySelectorAll('table tbody tr');
        let valueUpdated = false;
 
        rows.forEach(row => {
            const codeInput = row.querySelector('input[data-identifier="override-bill-cpt-code"]');
            if (!codeInput) return;
 
            const currentCode = codeInput.value.trim();
 
            if (CHARGE_MAP[currentCode]) {
                const newCharge = CHARGE_MAP[currentCode];
                const chargeInput = row.querySelector('input[data-identifier="override-bill-cpt-charge"]');
 
                if (chargeInput && chargeInput.value !== newCharge) {
                    setNativeValue(chargeInput, newCharge);
                    chargeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    chargeInput.dispatchEvent(new Event('change', { bubbles: true }));
                    chargeInput.dispatchEvent(new Event('blur', { bubbles: true }));
                    valueUpdated = true;
                }
            }
        });
 
        if (valueUpdated) {
            setTimeout(() => {
                clickOverrideButton(doc);
            }, 500);
        }
    }
 
    function runAllChecks() {
        const docs = [document];
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                if (iframe.contentDocument) docs.push(iframe.contentDocument);
            } catch (e) {
                // Cross-origin iframe bypass
            }
        });
 
        for (const doc of docs) {
            // If already overridden AND no new/unprocessed CPT codes exist, skip execution
            if (isAlreadyOverridden(doc) && !hasUnprocessedCPTCodes(doc)) {
                clearInterval(intervalId);
                return;
            }
        }
 
        if (hasClicked && hasOverridden) return;
 
        docs.forEach(doc => {
            if (!hasClicked) attemptOverride(doc);
            if (!hasOverridden) processDocument(doc);
        });
    }
 
    const intervalId = setInterval(() => {
        runAllChecks();
    }, 500);
})();
