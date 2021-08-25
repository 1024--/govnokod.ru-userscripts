// ==UserScript==
// @name         GK-settings
// @namespace    http://tampermonkey.net/
// @version      0.6.1
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

  const whitelist = {
    "2": "admin",
    "3": "striker",
    "721": "TarasB",
    "988": "wvxvw",
    "1183": "Dummy00001",
    "1347": "Soul_re@ver",
    "1438": "3.14159265",
    "1659": "inkanus-gray",
    "2853": "CHayT",
    "3818": "roman-kashitsyn",
    "4442": "defecate-plusplus",
    "4964": "vistefan",
    "5528": "bormand",
    "6824": "kegdan",
    "7146": "1024--",
    "7355": "j123123",
    "8086": "gost",
    "8394": "Fike",
    "10388": "Antervis",
    "12523": "3_dar",
    "21463": "HACTEHbKA",
    "21584": "3oJIoTou_xyu",
    "21984": "gostinho",
    "22050": "ASD_77",
    "23661": "Desktop",
    "25710": "rotoeb",
    "25986": "bootcamp_dropout",
    "26290": "DypHuu_niBEHb",
    "67480": "inkanusinho",
    "67653": "defecatinho",
    "67655": "nepeKamHblu_nemyx",
    "67780": "guest6",
    "67813": "JloJle4Ka",
    "67884": "gologub",
    "67888": "PolinaAksenova",
    "67915": "JaneBurt",
    "67935": "npopa6",
    "67936": "cKpuna4",
    "67984": "3EHuTHblu_nemyx",
    "67986": "MOPCKOu_nemyx",
    "67995": "COPOKA",
    "67998": "Tallybahn",
    "68000": "Staatssicherheit",
    "68003": "PE4HOu_nemyx",
    "68007": "ABryCTOBCKuu_nemyx",
  };

  const pituxes = {
    "51": "cecilie",
    "234": "miheich",
    "287": "bugotrep",
    "397": "grimskin",
    "462": "vladimir.loshchin",
    "581": "anycolor",
    "614": "Acid Beast",
    "617": "begmst",
    "628": "w-495",
    "629": "w495",
    "912": "nslz",
    "926": "comfly",
    "1027": "GovnocoderJr",
    "1054": "Novi4oK",
    "1060": "deniamnet",
    "1130": "smac",
    "1146": "newmindcore",
    "1199": "Balza",
    "1204": "Yari",
    "1205": "breathe",
    "1273": "gg_",
    "1331": "shureg",
    "1412": "MaaKut",
    "1541": "L5D",
    "1566": "bloby",
    "1577": "kir_rik",
    "1697": "avamana",
    "1699": "Aligan",
    "1703": "kit",
    "1711": "an0",
    "1717": "pyshpysh",
    "1742": "Cyanide",
    "1762": "lexa",
    "1785": "cdf_easy",
    "1788": "1234",
    "1849": "REDNES",
    "1887": "firefred",
    "1942": "lads",
    "1977": "cp7",
    "2083": "utinger",
    "2523": "111111",
    "2535": "jo0o00nyy",
    "3020": "blackray",
    "3048": "jfhs",
    "3062": "andrewiv",
    "3087": "ganzzz",
    "3217": "adepto",
    "3336": "Kayfolom",
    "3387": "alex-86",
    "3739": "max_wp",
    "3798": "ab368",
    "3823": "jenik15",
    "3842": "Guest_",
    "3941": "qweqweqwe",
    "4014": "Crabbe",
    "4192": "mirTONU",
    "5394": "NoYaSloPaToy",
    "5487": "Mixa830",
    "5488": "Denya795",
    "5489": "Denya19",
    "5490": "Pilot418",
    "5491": "Luna250",
    "5493": "Denya570",
    "5494": "fed190",
    "5495": "Mixa977",
    "5496": "Natashka615",
    "5497": "Natashka83",
    "5498": "Denya962",
    "5499": "Semen569",
    "5500": "Nemo781",
    "5501": "Denya254",
    "5502": "Pilot239",
    "5503": "Nemo407",
    "5504": "Semen477",
    "5505": "Pilot367",
    "5506": "Denya902",
    "5507": "Fedka75",
    "5508": "fed655",
    "5509": "Fedka776",
    "5510": "Nemo788",
    "5511": "Nemo553",
    "5512": "Luna629",
    "5513": "Natashka769",
    "5514": "Denya459",
    "5578": "qweqwe",
    "5705": "O___o",
    "5859": "emfs",
    "5955": "GK2012",
    "6334": "borius",
    "6410": "napmor",
    "7044": "Pifagor",
    "7176": "aderyabin",
    "7194": "beatmasta",
    "7472": "bjjjbjjj",
    "7559": "Bezeus",
    "7641": "a282750",
    "7929": "ifirf1",
    "8226": "denisOg",
    "8243": "potapuff",
    "8525": "LXxhELT",
    "8543": "lakrVOg",
    "8547": "AAypEIq",
    "8551": "agfvTzv",
    "8552": "COMHPiI",
    "8558": "qlqRjbp",
    "8638": "bjbAMvU",
    "8657": "bFaInlN",
    "8665": "BLDPAXP",
    "8696": "ohYmFNJ",
    "8781": "bGczbZF",
    "8786": "MITtMIq",
    "8793": "KPbhVgy",
    "8808": "coHTwmS",
    "8834": "mvuBfZP",
    "8847": "bfGjKRC",
    "8848": "qSEWuQd",
    "8891": "LHXzxZk",
    "8892": "cpZFbWH",
    "8905": "bkiSKwd",
    "8912": "ADBzYkS",
    "8915": "KQGqNsI",
    "8932": "qixKopY",
    "8945": "QNOZFti",
    "8960": "mIwxJAl",
    "8975": "McWQUOE",
    "9007": "MiEpoZc",
    "9014": "bkezArB",
    "9036": "kxKIHhJ",
    "9304": "105_306330_ru",
    "9492": "312312",
    "9581": "Chupacabramiamor",
    "9928": "Jaroslav285",
    "9972": "jey-val-star",
    "10149": "noganno",
    "10247": "ajtkulov",
    "10365": "lord_rb",
    "12559": "victir",
    "12885": "alex_matviichuk",
    "12930": "Sandwich",
    "13826": "qwe345asd",
    "13888": "bdevnameless",
    "13926": "Vasia",
    "14103": "Tim_Walker",
    "14235": "shishi",
    "14316": "7u7",
    "14317": "454",
    "14326": "none1",
    "14364": "mikakak",
    "14388": "petia",
    "21660": "negr",
    "21679": "OTK_Anusov",
    "21682": "passiv",
    "21886": "slesar_kip",
    "21905": "vadik",
    "21966": "AedenJackson",
    "21988": "ncuxonam",
    "23479": "dick",
    "23619": "NNCYC",
    "25118": "acula98",
    "25252": "macaque_gomosek",
    "25543": "ikekyourmom",
    "25580": "guest8",
    "25615": "CrashTesteAnusov",
    "25697": "LinuxGovno",
    "25778": "jdryand",
    "25795": "3oJloToy_xyeLL",
    "25796": "3oJloTou_xyeLL",
    "25885": "vkasci",
    "25930": "adrnin",
    "26065": "ne4eHb",
    "26097": "Lemming",
    "26216": "AHCKujlbHblu_netyx",
    "26278": "guest10",
    "26279": "guest9",
    "26280": "guest7",
    "26293": "neTyx_npoTKHyTbIu",
    "67199": "SteadfastTinCock",
    "67205": "inseminator",
    "67237": "monobogdan",
    "67278": "CkpunmoBbIu_nemyx",
    "67281": "AHaHkacmHbIu_nemyx",
    "67285": "MAKAKA",
    "67286": "MAPTbIwKA",
    "67289": "6a6yuH",
    "67299": "ru66oH4uk",
    "67306": "6oHo6o",
    "67308": "Bo3MyIIIeHHbIu_nemyx",
    "67333": "A_P_Suslikov",
    "67380": "miwomare",
    "67456": "MEJlOMAH",
    "67459": "Wyrap_nJll-oM_qpaupu",
    "67461": "Jll-O6OBb",
    "67601": "KoBudHbIu_nemyx",
    "67722": "MOXHATKA",
    "67781": "guest3",
    "67795": "OCETuH_",
    "67823": "CBuHOKYP",
  };

  var newpituxes = Object.create(null);

  $.gk('comments').each(function () {
    const uid = $(this).gk('@uid');
    if (uid in whitelist) return;
    
    if (uid in pituxes) {
      $(this).gk('container').remove();
      return;
    }
    
    $(this).gk('container').css('background-color', '#fee');

    //// Analytical filter. Uncomment to enable
    // const text = $(this).find('.comment-text:first');
    // const fmt = text.find('span,b,i'), txt = text.text();
    // if (fmt.length && (fmt.length > 0.9 * txt.split(/\s+/).length)) {
    //   $(this).gk('container').remove();
    //   const name = $(this).gk('@name');
    //   newpituxes[uid] = name;
    //   return;
    // }
    // if (fmt.length) {
    //   var nfmt = [].map.call(fmt,f=>f.textContent.length).reduce((x,y)=>x+y,0);
    //   if (nfmt > 0.4 * txt.length) {
    //     $(this).gk('container').remove();
    //     const name = $(this).gk('@name');
    //     newpituxes[uid] = name;
    //     return;
    //   }
    // }
  });

  //// Saving pituxes catched by the analytical filter. Uncomment to enable
  // for (var _ in newpituxes) {
  //   const oldnewpituxes = JSON.parse(localStorage.getItem(PARAM + '-2') || '{}');
  //   for (let id in oldnewpituxes) newpituxes[id] = oldnewpituxes[id];
  //   localStorage.setItem(PARAM + '-2', JSON.stringify(newpituxes));
  //   break;
  // }
})();
