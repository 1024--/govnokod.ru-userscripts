// ==UserScript==
// @name         GK-settings
// @namespace    http://tampermonkey.net/
// @version      0.5.6
// @description  no smegma
// @author       1024--, j123123
// @match        *://govnokod.ru/*
// @match        *://www.govnokod.ru/*
// @grant        none
// ==/UserScript==

/**
Copyright © 2021 1024--, j123123
This work is free. You can redistribute it and/or modify it under the
terms of the Do What The Fuck You Want To Public License, Version 2,
as published by Sam Hocevar. See http://www.wtfpl.net/ for more details.
*/

(function() {
    'use strict';

    if (location.pathname === '/comments') return;

    const PARAM = '46c65898-fa7b-49bf-a4d0-f794ff1aa866';

    $.gk('comments:gkhidden>show');

    const whitelist = [
'1024--',
'3.14159265',
'3_dar',
'3EHuTHblu_nemyx',
'3oJIoTou_xyu',
'ABryCTOBCKuu_nemyx',
'admin',
'Antervis',
'ASD_77',
'bormand',
'CHayT',
'cKpuna4',
'COPOKA',
'defecate-plusplus',
'defecatinho',
'Desktop',
'Dummy00001',
'DypHuu_niBEHb',
'Fike',
'gologub',
'gost',
'gostinho',
'guest6',
'HACTEHbKA',
'inkanus-gray',
'inkanusinho',
'j123123',
'JaneBurt',
'JloJle4Ka',
'kegdan',
'MOPCKOu_nemyx',
'nepeKamHblu_nemyx',
'npopa6',
'PE4HOu_nemyx',
'PolinaAksenova',
'roman-kashitsyn',
'rotoeb',
'ru66oH4uk',
'Soul_re@ver',
'Staatssicherheit',
'striker',
'Tallybahn',
'vistefan',
'wvxvw',
        ];

    const pituxes = [
'cecilie',
'bugotrep',
'grimskin',
'vladimir.loshchin',
'anycolor',
'Acid Beast',
'begmst',
'comfly',
'GovnocoderJr',
'Novi4oK',
'deniamnet',
'smac',
'newmindcore',
'breathe',
'gg_',
'shureg',
'MaaKut',
'bloby',
'kir_rik',
'avamana',
'Aligan',
'kit',
'an0',
'pyshpysh',
'Cyanide',
'lexa',
'cdf_easy',
'1234',
'REDNES',
'firefred',
'utinger',
'jo0o00nyy',
'andrewiv',
'ganzzz',
'Kayfolom',
'Mixa830',
'Denya795',
'Denya19',
'Pilot418',
'Luna250',
'Denya570',
'fed190',
'Mixa977',
'Natashka615',
'Natashka83',
'Denya962',
'Semen569',
'Nemo781',
'Denya254',
'Pilot239',
'Nemo407',
'Semen477',
'Pilot367',
'Denya902',
'Fedka75',
'fed655',
'Fedka776',
'Nemo788',
'Nemo553',
'Luna629',
'Natashka769',
'Denya459',
'borius',
'Pifagor',
'potapuff',
'Chupacabramiamor',
'ajtkulov',
'Sandwich',
'guest3',
'CBuHOKYP',
'MAPTbIwKA',
'MAKAKA',
'312312',
'111111',
'3oJloTou_xyeLL',
'3oJloToy_xyeLL',
'454',
'adrnin',
'6a6yuH',
'6oHo6o',
'7u7',
'a282750',
'105_306330_ru',
'AAypEIq',
'ab368',
'aderyabin',
'adepto',
'ADBzYkS',
'beatmasta',
'agfvTzv',
'AedenJackson',
'AHCKujlbHblu_netyx',
    ];
    var pituxes_ = {};
    pituxes.forEach(p => {pituxes_[p] = true; });
    var whitelist_ = {};
    whitelist.forEach(p => {whitelist_[p] = true; });

    var newpituxes = Object.create(null);

    $.gk('comments').each(function () {
        const name = $(this).gk('@name');
        if (name in whitelist_) return;
        if (name in pituxes_) {
            $(this).gk('container').remove();
            return;
        }

        const text = $(this).find('.comment-text:first');
        const fmt = text.find('span,b,i'), txt = text.text();
        if (fmt.length && (fmt.length > 0.9 * txt.split(/\s+/).length)) {
            $(this).gk('container').remove();
            newpituxes[name] = true;
            return;
        }
        if (fmt.length) {
            var nfmt = [].map.call(fmt,f=>f.textContent.length).reduce((x,y)=>x+y,0);
            if (nfmt > 0.4 * txt.length) {
                $(this).gk('container').remove();
                newpituxes[name] = true;
                return;
            }
        }
    });

    for (var _ in newpituxes) {
        JSON.parse(localStorage.getItem(PARAM) || '[]').forEach(p => newpituxes[p] = true);
        localStorage.setItem(PARAM, JSON.stringify(Object.keys(newpituxes)));
        break;
    }
})();
