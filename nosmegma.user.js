// ==UserScript==
// @name         GK-settings
// @namespace    http://tampermonkey.net/
// @version      0.4.1
// @description  no smegma
// @author       1024--, j123123
// @match        *://govnokod.ru/*
// @match        *://www.govnokod.ru/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (location.pathname === '/comments') return;

    $.gk('comments:gkhidden>show');

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
    ];
    var pituxes_ = {};
    pituxes.forEach(p => {pituxes_[p] = true; });

    $.gk('comments').each(function () {
        const name = $(this).gk('@name');
        if (name in pituxes_) {
            $(this).gk('container').remove();
            return;
        }

        const text = $(this).gk('text');
        const nfmt = text.find('span,b,i').length;
        if (nfmt > 3 && nfmt > 0.9 * text.text().split(/\s+/).length)
            $(this).gk('container').remove();
    });
})();
