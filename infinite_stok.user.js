// ==UserScript==
// @name Бесконечный сток
// @namespace govnokod
// @description Подключает бесконечный сток Борманда к стоку ГК
// @include http://govnokod.ru/comments
// @include http://www.govnokod.ru/comments
// @version 2.0.1
// @grant none
// ==/UserScript==

(function(){

  function text(t){ return document.createTextNode(t); };

  function id(el){
    var url = el.attr('href');
    if(!url) return;
    var m = url.match(/\d+$/);
    return m && m[0];
  }

  function filterInfiniteStok(comments){
    var stokPostsElements = $('li.hentry');
    var stokPosts = {}, Nstok = 0;
    
    stokPostsElements.each(function(){
      var ID = id($(this).find('a.entry-title:first'));
      if(ID) stokPosts[ID] = true;
    });
    
    return comments.filter(function(comm){
      return !(comm.thread_id in stokPosts);
    });
  }

  function postInfo(entry){
    var UID = entry.user_id;
    var PID = entry.thread_id;
    var PID2 = entry.reply_id;
    var CID = entry.comment_id;
    var postRef = '/' + PID;
    var commName = 'comment' + CID;
    var commRef = '/' + PID + '#comment' + CID;
    var answerRef = PID2 == null ?
      commRef :
      '/comments/' + PID2 + '/post?replyTo=' + CID;
    var userRef = '/user/' + UID;
    var userName = entry.user_name;
    var time = entry.posted;
    var hrtime = entry.posted;
    var avatar = UID == 1 ?
      '/files/avatars/guest_28.png' :
      'http://www.gravatar.com/avatar/' + entry.avatar_hash +
      '?default=http%3A%2F%2Fgovnokod.ru%2Ffiles' +
      '%2Favatars%2Fnoavatar_28.png&amp;r=pg&amp;size=28';
    var commHTML = entry.text;
    
    return $('<li/>', {'class': "hentry"})
      .append($('<h2/>', {text: 'Комментарий к ' })
        .append($('<a/>', {rel: "bookmark", 'class': "entry-title",
                           href: postRef, text: 'говнокоду #' + PID})))
      .append($('<div/>', {'class': "entry-comments"})
        .append($('<ul/>')
          .append($('<li/>', {'class': "hcomment"})
            .append($('<div/>', {'class': "entry-comment-wrapper"})
              .append($('<p/>', {'class': "entry-info"})
                .append($('<img/>', {'class': "avatar", src: avatar,
                                     alt: "ava", title: "Аватар"}))
                .append($('<strong/>', {'class': "entry-author"})
                  .append($('<a/>', {href: userRef, text: userName})))
                .append($('<abbr/>', {'class': "published",
                                      title: time, text: hrtime}))
                .append($('<a/>', {href: commRef, name: commName,
                                   title: "Ссылка на комментарий",
                                   'class': "comment-link", text: '#'})))
              .append($('<li/>', {'class': "entry-comment"})
                .append($(commHTML)))
              .append($('<a/>', {'class': "answer", href: answerRef,
                                 text: 'Ответить'}))))))
      .append($('<div/>', {'class': "show-code"})
        .append($('<a/>', {href: '/'+PID, 'class': "show-code-trigger", text: 'Показать код ▼'})
          .click(function(){
            var $this = $(this);
            var $holder = $this.parent().children('.code-holder');
            if($holder.css('display') == 'block') {
              $this.text('Показать код ▼');
              $holder.css('display', '');
            } else {
              $this.text('Скрыть код ▲');
              $holder.css('display', 'block');
              
              if(!$holder.children().length) {
                $holder.text('Загружается...');
                $.ajax({
                  url: this.href,
                  success: function(data){
                    $holder.text('');
                    $holder.append($(data).find('li.hentry').children());
                  },
                  error: function(){
                    $holder.text('Ошибка загрузки :(');
                  }
                });
              }
            }
            return false;
          }))
        .append($('<div/>', {'class': "code-holder"}))
      );
;
  }

  function stokElement(){ return $('ol.posts'); }

  function infoBlock(type, color){
    return $('<li/>', {'class': "hentry", style: 'background-color: ' + color })
      .append($('<h2/>', { text: type, style: 'color: #444' }));
  }
  
  function error(t){
    return infoBlock('Ошибка', '#fcc').append(text(t));
  }
  
  function warning(t){
    return infoBlock('Предупреждение', '#ffc').append(text(t));
  }

  function appendPosts(stok){
    // no api_version
    // var REQUIRED_VERSION = 2;
    // if(stok.api_version != REQUIRED_VERSION) {
      // stokElement().append(error('Борманд сменил версию API. Было ' +
        // REQUIRED_VERSION + ', стало ' + stok.api_version + '.' +
        // ' Надеемся на обратную совместимость.'));
    // }

    var comments = filterInfiniteStok(stok);
    var fragment = document.createDocumentFragment();
        
    if(comments.length >= stok.length)
      fragment.appendChild(warning('Возможно, сток порван.')[0]);
    
    for(var i=0; i < comments.length; ++i)
      fragment.appendChild(postInfo(comments[i])[0]);
    
    stokElement().append(fragment);
  }
  
  var oldestCommentID = id($($('li.hcomment a.comment-link').get(14)));
  
  function onLBClick(event){
    $(this).remove();
    
    var stub = infoBlock('Бесконечный сток', '#cfc')
      .append(text('Загружается...'));
    
    stokElement().append(stub);
    
    $.ajax({
      url: "http://146.185.130.46/ngk/api/v1/latest?id_less_than=" + oldestCommentID,
      cache: false,
      success: function(data){
        try {
          // if(typeof data === 'string')
            // data = JSON.parse(data);
          appendPosts(data);
          oldestCommentID = data[14].comment_id;
          appendLoadButton('');
        } catch(e){
          appendLoadButton('Ошибка: ' + e.message);
        }
        stub.remove();
      },
      error: function(){
        appendLoadButton('Ошибка загрузки бесконечного стока.');
        stub.remove();
      }
    });
    
    return false;
  }
    
  function appendLoadButton(error){
    var button = infoBlock('Бесконечный сток', '#cfc');
    if(error) button.append($('<span/>', {text: error}));
    button.append('<a class="bormand-stok" href="#">' +
      'Хочу ещё!</a>');
    button.click(onLBClick);
    stokElement().append(button);
  }
  
  appendLoadButton('');

})();