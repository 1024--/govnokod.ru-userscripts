// ==UserScript==
// @name Главная в стоке
// @namespace govnokod
// @description Добавляет в сток ГК информацию о постах с главной.
// @include http://govnokod.ru/comments
// @include http://www.govnokod.ru/comments
// @version 1.0.2
// @grant none
// ==/UserScript==

(function($){

  function text(t){ return document.createTextNode(t); };
  
  function matches(string, regexp){
    var matches = [];
    var lastIndex = regexp.lastIndex = 0, match;
    while(match = regexp.exec(string)) {
      matches.push(match);
      if(regexp.lastIndex === lastIndex) break;
      lastIndex = regexp.lastIndex;
    }
    return matches;
  }

  var pidID = 1, descrID = 2, avatarID = 3, uidID = 4,
      unameID = 5, timeID = 6, htimeID = 7;
  var entryRE = /<li\sclass="hentry">[\s\S]*?Говнокод\s#(\d+)<\/a>[\s\S]*?<p\sclass="description">([\s\S]*?)<\/p>[\s\S]*?<img\ssrc="http:\/\/www.gravatar.com\/avatar\/(.*?)\?default=[\s\S]*?govnokod.ru\/user\/(\d+)">(.*?)<\/a>[\s\S]*?<abbr\stitle="(.*?)">(.*?)<\/abbr>/g;

  function postInfo(entry){
    var UID = entry[uidID];
    var PID = entry[pidID];
    var postRef = '/' + PID;
    var userRef = '/user/' + UID;
    var userName = entry[unameID];
    var time = entry[timeID];
    var hrtime = entry[htimeID];
    var avatar = UID == 1 ?
      '/files/avatars/guest_28.png' :
      'http://www.gravatar.com/avatar/' + entry[avatarID] +
      '?default=http%3A%2F%2Fgovnokod.ru%2Ffiles' +
      '%2Favatars%2Fnoavatar_28.png&amp;r=pg&amp;size=28';
    var postHTML = entry[descrID];
    
    return $('<li/>', {'class': "hentry"})
      .append($('<h2/>')
        .append($('<a/>', {rel: "bookmark", 'class': "entry-title",
                           href: postRef, text: 'Говнокод #' + PID})))
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
                                      title: time, text: hrtime})))
              .append($('<div/>', {'class': 'entry-comment',
                                   html: postHTML}))))));
  }

  function stokElement(){ return $('ol.posts'); }

  function infoBlock(type, color){
    return $('<li/>', {'class': "hentry", style: 'background-color: ' + color })
      .append($('<h2/>', { text: type, style: 'color: #444' }));
  }
  
  function id(el, sel){
    var url = $(el).find(sel).attr('href');
    if(!url) return;
    var m = url.match(/\d+$/);
    return m && m[0];
  }
  
  function insertPostInfo(mainPageContent){
    var stokPostsElements = $('li.hentry');
    var stokPosts = {};
    
    stokPostsElements.each(function(){
      var ID = id(this, 'a.entry-title:first');
      if(ID) stokPosts[ID] = true;
    });
    
    var posts = matches(mainPageContent, entryRE).filter(function(post){
      return !(post[pidID] in stokPosts);
    });
    
    var m = 0;
    for(var s=0; s<stokPostsElements.length; ++s){
      var stokPost = stokPostsElements.eq(s);
      var t = stokPost.find('abbr.published').attr('title');
      if(!t) continue;
      var date = new Date(t);
      while(m<posts.length && date < new Date(posts[m][timeID])){
        stokPost.before(postInfo(posts[m]));
        ++m;
      }
    }
    
    // Посты, созданные ранее самого раннего комментария из стока.
    // var stok = stokElement();
    // for(; m < posts.length; ++m){
      // stok.append(postInfo(posts[m]));
    // }
    
    // Для лучшей состыковки со стоком Борманда, не будем их выводить, но упомянем.
    if(m < posts.length)
      stokElement()
        .append(infoBlock('Ещё говнокоды с главной', '#eee')
          .append($('<span/>', {html:
            posts.slice(m).map(function(post){
              return '<a href="/' + post[pidID] + '">#' + post[pidID] + '</a>'; })
            .join(', ') + '.' })));
  
  }

  $.ajax({
    url: '/',
    cache: false,
    success: function(data){
      try {
        insertPostInfo(data);
      } catch(e){
        stokElement()
          .append(infoBlock('Ошибка', '#fcc')
            .append(text('Не удаётся построить: ' + e.stack)));
      }
    },
    error: function(){
        stokElement()
          .append(infoBlock('Ошибка', '#fcc')
            .append(text('Не удаётся загрузить главную.')));
    }
  });
  
})(jQuery);