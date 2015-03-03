// ==UserScript==
// @name govnokod: Who?
// @namespace govnokod
// @description describes user by his/her statistics.
// @include http://govnokod.ru/user/*
// @include http://www.govnokod.ru/user/*
// @version 1.0.48
// @grant none
// ==/UserScript==


function init(){
  storableProperties = properties.filter(function(x){ return x.storable; });
  fixedProperties = properties.filter(function(x){
    return !x.storable && x.fixed;
  });
  dateUnit = 1000 * 60;
  baseDate = Date.UTC(2008,11,1);
  digits = ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"+
    "0123456789`~@#$%^&*()_+=/;<>,?[]{}:'").split('');
  decodeDigit = {};
  digits.forEach(function(d,i){ decodeDigit[d] = i; });
}

function UserProperty(id, name, storable, fixed, userToValue, userToString){
  this.storable = storable;
  this.fixed = fixed;
  this.id = id;
  this.name = name;
  this.calculate = !this.storable && this.fixed && userToValue;
  this._fromValue = userToString || null;
  this.fromUser = this.storable && userToValue ||
    this._fromValue || function(u){
      return String(u[id]);
    };
}

function User(str, common){
  var props = str ? str.split('.') : Array(storableProperties.length);
  var that = this;
  this._common = common || {};
  props.map(unpackNumber).forEach(function(prop, i){
    that[storableProperties[i].id] = prop;
  });
  fixedProperties.forEach(function(prop){
    that[prop.id] = prop.calculate(that);
  });
}

function unpackNumber(s){
  if(!s) return 0;
  var isNegative = s.charAt(0) == '-', n = 0;
  for(var i=+isNegative; i<s.length; ++i){
    n *= digits.length;
    n += decodeDigit[s.charAt(i)];
  }
  return isNegative ? -n : +n;
}

function formatDate(v){
  if (!v) return null;
  return (new Date(v)).toLocaleString();
}

function unpackDate(v, base){
  if (!v) return null;
  return dateUnit * v + (base || baseDate);
}

function main(usersStr, commonData){
  init();
  
  var users = usersStr.replace(/!(\d+)(.)/g, function(_, num, symb){
    return (new Array(+ num + 1)).join(symb);
  }).split('|');
  usersStr = '';
  
  var uid = +location.pathname.match(/\d+$/)[0];
  var user = new User(users[uid], commonData);

  $('li.hentry')
    .append('<div class="user-properties"><br/>' +
    properties.map(function(prop){
      if(!prop.name) return '';
      var p = prop.fromUser(user);
      if(p == null) return '';
      return '<b>' + prop.name + '</b>: ' +
      prop.fromUser(user) + '<br/>';
    }).join('') +
    '</div>');
}

var baseDate, digits, decodeDigit, dateUnit, storableProperties, fixedProperties;
var properties = [
new UserProperty ("firstAction", "", 0, 1, function (u){
    return unpackDate(u.rawFirstAction);
  }, null),
new UserProperty ("lastAction", "", 0, 1, function (u){
    return unpackDate(u.rawLastAction, u.firstAction);
  }, null),
new UserProperty ("", "Адекватность", 0, 0, 0, function (u){
    var p = u.posts ? 50 + 50 * (u.goodPosts - u.badPosts) / (u.posts||1) : 50;
    var c = u.comments ?
      50 + 50 * (u.goodComments - u.badComments) / (u.comments||1) : 50;
    return '<b>' + p.toFixed(2) + '%</b> по постам; <b>' +
      c.toFixed(2) + '%</b> по комментариям';
  }),
new UserProperty ("", "Крутизна", 0, 0, 0, function (u){
    var A = 0.4;
    var p = u.posts ? u.postVotes / Math.pow(u.posts   ||1, A) +
      Math.pow(u.posts, A) : 0;
    var c = u.comments ? u.commVotes / Math.pow(u.comments||1, A) +
      Math.pow(u.comments, A) : 0;
    return '<b>' + p.toFixed(2) + '</b> по постам; <b>' +
      c.toFixed(2) + '</b> по комментариям';
  }),
new UserProperty ("posts", "Постов", 1, 1, 0, function (u){
    if(!u.posts) return '<b>0</b>';
    return '<b>' + u.posts + '</b> всего; ' +
      (u.goodPosts ? '<b>' + u.goodPosts + '</b> (' +
      (u.goodPosts / u.posts * 100).toFixed(2) + '%)' : '<b>0</b>') +
      ' хороших; ' +
      (u.badPosts ? '<b>' + u.badPosts + '</b> (' +
      (u.badPosts / u.posts * 100).toFixed(2) + '%)' : '<b>0</b>') +
      ' плохих' +
      (u.postVotes ? '; с рейтингом <b>' + u.postVotes + '</b> в сумме (' +
      (u.postVotes / u.posts).toFixed(2) + ' на пост, ' +
      u.postVotesMed + ' медиана)' : '');
  }),
new UserProperty ("postVotes", "", 1, 1, 0, null),
new UserProperty ("postVotesMed", "", 1, 1, 0, null),
new UserProperty ("goodPosts", "", 1, 1, 0, null),
new UserProperty ("badPosts", "", 1, 1, 0, null),
new UserProperty ("postsPerDay", "", 0, 1, function (u){
    var dt = u._common.lastUpdate - u.firstAction;
    return u.posts && dt ? 1000 * 3600 * 24 * u.posts / dt : 0;
  }, null),
new UserProperty ("comments", "Комментариев", 1, 1, 0, function (u){
    if(!u.comments) return '<b>0</b>';
    return '<b>' + u.comments + '</b> всего; ' +
      (u.goodComments ? '<b>' + u.goodComments + '</b> (' +
      (u.goodComments / u.comments * 100).toFixed(2) + '%)' : '<b>0</b>') +
      ' хороших; ' +
      (u.badComments ? '<b>' + u.badComments + '</b> (' +
      (u.badComments / u.comments * 100).toFixed(2) + '%)' : '<b>0</b>') +
      ' плохих' +
      (u.commVotes ? '; с рейтингом <b>' + u.commVotes + '</b> в сумме (' +
      (u.commVotes / u.comments).toFixed(2) + ' на комментарий, ' +
      u.commVotesMed + ' медиана)' : '');
  }),
new UserProperty ("commVotes", "", 1, 1, 0, null),
new UserProperty ("commVotesMed", "", 1, 1, 0, null),
new UserProperty ("goodComments", "", 1, 1, 0, null),
new UserProperty ("badComments", "", 1, 1, 0, null),
new UserProperty ("commentsPerDay", "", 0, 1, function (u){
    var dt = u._common.lastUpdate - u.firstAction;
    return u.comments && dt > 0 ? 1000 * 3600 * 24 * u.comments / dt : 0;
  }, null),
new UserProperty ("", "Создаёт", 0, 0, 0, function (u){
    if(!u.comments && !u.posts) return null;
    
    return (u.posts ? '<b>' + u.postsPerDay.toFixed(2) + '</b> постов в день (' +
      (u.postsPerDay * 365.25).toFixed(2) + ' в год)' + (u.comments ? '; ' : '') : '') +
      (u.comments ? '<b>' + u.commentsPerDay.toFixed(2) + '</b> комментариев в день (' +
      (u.commentsPerDay * 365.25).toFixed(2) + ' в год)' : '');
  }),
new UserProperty ("commLength", "Объём комментариев", 1, 1, 0, function (u){
    if(!u.comments) return null;
    return '<b>' + u.commLength + '</b> суммарный (' +
      (u.commLength / u.comments).toFixed(2) + ' средний, ' +
      u.commMedian + ' медиана) или ' + '<b>' + u.symbPerDay.toFixed(2) + '</b> символов в день (' +
      (u.symbPerDay * 365.25).toFixed(2) + ' в год)' +
      (u.commLength > 3e6 ? '; написал "Войну и Мир" в комментариях' : '');
  }),
new UserProperty ("symbPerDay", "", 0, 1, function (u){
    return u.comments ? u.commentsPerDay * u.commLength / u.comments : 0;
  }, null),
new UserProperty ("commMedian", "", 1, 1, 0, null),
new UserProperty ("rawFirstAction", "", 1, 1, 0, null),
new UserProperty ("rawLastAction", "", 1, 1, 0, null),
new UserProperty ("", "Известные действия", 0, 0, 0, function (u){
    if(!u.firstAction || !u.lastAction) return 'не зарегистрированы';
    return 'c ' + formatDate(u.firstAction) + ' по ' + formatDate(u.lastAction) +
    ' (обновлено ' + formatDate(u._common.lastUpdate) + ')';
  })
];
