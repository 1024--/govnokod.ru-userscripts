// ==UserScript==
// @name govnokod: autobred
// @namespace govnokod
// @description sends something strange
// @include http://govnokod.ru/*
// @include http://www.govnokod.ru/*
// @version 1.4.0
// @grant none
// ==/UserScript==

// Адаптированный код inkanus-gray
// http://govnokod.ru/16567#comment247654

function rand(n) { return Math.random() * n | 0; }

function stringToPairs(s, chlen, base) {
  var pairs = {};
  for (var i = 0, n = s.length - base; i < n; ++i) {
    var key = s.substr(i, base);
    if(!(key in pairs)) pairs[key] = [];
    pairs[key].push(s.substr(i + base, chlen));
  }
  return pairs;
}
 
function getNextSym(s, pairs) {
  if(!(s in pairs)) return '';
  var next = pairs[s];
  return next.length ? next[rand(next.length)] : '';
}
 
function bugurt(start, pairs, len, base) {
  var result = start;
  while (len > 0 && start !== '') {
    start = getNextSym(result.substr(-base), pairs);
    result += start;
    len--;
  }
  return result;
}
 
function bred(text, start, textlen, base, chlen) {
  return bugurt(start.substr(0, base), stringToPairs(text, chlen, base), textlen, base);
}

// Берём текст из комментариев и отвечаем.

function es(s){ return Array.prototype.slice.apply(document.querySelectorAll(s)); }
function e(id){ return document.getElementById(id); }

(function(){
  
  var comments = es('.comment-text').map(function(x){ return x.textContent; });
  var text = comments.join(' ');
  var answerButtons = es('a.answer, h3>a');
  
  if(text.length < 200 || !answerButtons.length) return;
  
  answerButtons.forEach(function(button){
    var ans = document.createElement('a');
    ans.href = '#I-should-enable-javascript';
    ans.innerHTML = 'Ответить бредом';
    ans.className = 'answer bred-answer';
    ans.style.marginLeft = '1ex';
    ans.addEventListener('click', function(event){
      button.onclick();
      e('formElm_text').value = bred(text, comments[rand(comments.length)], 300, 7, 2);
      event.preventDefault();
    });
    button.parentNode.appendChild(ans);
  });
  
})();