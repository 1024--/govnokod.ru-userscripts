// ==UserScript==
// @name         Ignorast
// @version      0.3
// @match        *://govnokod.ru/*
// @match        *://www.govnokod.ru/*
// @grant        none
// ==/UserScript==

// см. настройки бана в меню пользователя
// Для работы нужно подключить gQuery

(function($) {
  if(!/\/\d+/.test(location.pathname)) return;
  
  var SCRIPT_ID = 'e79a9913-02be-494f-88bd-28c149013cf1';
  var BANNED = SCRIPT_ID + '-banned';
  var MODE = SCRIPT_ID + '-mode';
  var BTN_CLASS = 'userscript-banned';

  var banned = {};
  var modeHTML = localStorage.getItem(MODE) == 'HTML';

  (localStorage.getItem(BANNED) || '').split(',').forEach(function(uid){
    if(uid) banned[uid] = true;
  });

  function banHTML(comms) { comms.children('.entry-comment-wrapper').hide(); }
  function banGK(comms) { if(comms.length) comms.gk('hide'); }
  function unbanHTML(comms) { comms.children('.entry-comment-wrapper').show(); }
  function unbanGK(comms) { if(comms.length) comms.gk('show'); }

  (modeHTML ? banHTML : banGK)($.gk('comments')
    .each(function() {
      var comm = $(this);
      var uid = comm.gk('@uid');
      comm.gk('link')
        .after($('<a href="#" class="' + BTN_CLASS + '">' +
          (uid in banned ? 'разбанить' : 'забанить') + '</a>')
          .css('margin-left', '1ex')
          .click(function() {
            var comms = $.gk('comments:gkuid(' + uid + ')');
            if(uid in banned) {
              delete banned[uid];
              (modeHTML ? unbanHTML : unbanGK)(comms);
              comms.gk('link').siblings('.' + BTN_CLASS).text('забанить');
            } else {
              banned[uid] = true;
              (modeHTML ? banHTML : banGK)(comms);
              comms.gk('link').siblings('.' + BTN_CLASS).text('разбанить');
            }
            localStorage.setItem(BANNED, Object.keys(banned).join(','));
            return false;
          }));
    })
    .filter(function(){ return $(this).gk('@uid') in banned; }));

  $('.pane-content ul')
    .append('<li><p>Настройки бана</p></li>')
    .append($('<li></li>')
      .append($('<a href="#">' +
        (modeHTML ? 'режим: скрытие' : 'режим: спойлер') + '</a>')
        .click(function() {
          var comms = $.gk('comments')
            .filter(function(){ return $(this).gk('@uid') in banned; });
          modeHTML = !modeHTML;
          if(modeHTML) {
            localStorage.setItem(MODE, 'HTML');
            $(this).text('режим: скрытие');
            unbanGK(comms); banHTML(comms);
          } else {
            localStorage.setItem(MODE, 'GK');
            $(this).text('режим: спойлер');
            unbanHTML(comms); banGK(comms);
          }
          return false;
        })))
    .append($('<li></li>')
      .append($('<a href="#">разбанить всех</a>')
        .click(function() {
          var comms = $.gk('comments')
            .filter(function(){ return $(this).gk('@uid') in banned; });
          (modeHTML ? unbanHTML : unbanGK)(comms);
          comms.gk('link').siblings('.' + BTN_CLASS).text('забанить');
          banned = {};
          localStorage.setItem(BANNED, '');
          return false;
        })));

})(window.jQuery || window.$);