// ==UserScript==
// @name Бесконечный сток
// @namespace govnokod
// @description Подключает бесконечный сток Борманда к стоку ГК
// @include http://govnokod.ru/comments
// @include http://www.govnokod.ru/comments
// @version 0.1.1
// @grant none
// ==/UserScript==

(function(){
  
  // временно
  var tmpData = "{\"comments\": [{\"text\": \"\r\n\\u041c\\u0430\\u0433\\u0438\\u0441\\u0442\\u0440\\u043e\\u043c \\u043a\\u043e\\u043c\\u043f\\u044c\\u044e\\u0442\\u0435\\u0440\\u043d\\u044b\\u0445 \\u043d\\u0430\\u0443\\u043a\r\n\\n \", \"published\": \"2014-09-27T04:58:11Z\", \"id\": 249914, \"thread\": 16762, \"user\": {\"ava\": \"1e091ee10f13a1c2dcc18f60b574f889\", \"id\": 6824, \"name\": \"kegdan\"}}, {\"text\": \"\r\nSIGleton?\r\n\\n \", \"published\": \"2014-09-27T04:50:15Z\", \"id\": 249912, \"thread\": 16769, \"user\": {\"ava\": \"6735a32ca5ef81f2d7abb4b4b86125e9\", \"id\": 8086, \"name\": \"gost\"}}, {\"text\": \"\r\ngtfo.\r\n\\n \", \"published\": \"2014-09-27T04:05:00Z\", \"id\": 249906, \"thread\": 15627, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\n\\u0430 \\u0440\\u0438\\u0444\\u043c\\u0430 \\u0438 \\u0440\\u0438\\u0442\\u043c? \\u042f \\u043e\\u0436\\u0438\\u0434\\u0430\\u044e, \\u0447\\u0442\\u043e \\u0438\\u0445 \\u043e\\u0442\\u0441\\u0443\\u0442\\u0441\\u0442\\u0432\\u0438\\u0435 - \\u0443\\u0434\\u0438\\u0432\\u0438\\u0442. \\u0412 \\u043e\\u0431\\u0449\\u0435\\u043c, \\u044d\\u043a\\u0441\\u043f\\u0435\\u0440\\u0438\\u043c\\u0435\\u043d\\u0435\\u043d\\u0438\\u0435 \\u043d\\u0435\\u0441\\u043a\\u043e\\u043b\\u044c\\u043a\\u043e \\u043b\\u0438\\u0448\\u044c \\u0432 \\u043c\\u0435\\u043b\\u043a\\u0438\\u0445 \\u0434\\u0435\\u0442\\u0430\\u043b\\u044f\\u0445 \\u0440\\u0435\\u0430\\u043b\\u0438\\u0437\\u0430\\u0446\\u0438\\u0438 \\u0412 \\u0442\\u043e\\u043c \\u0447\\u0442\\u043e \\u0442\\u0443\\u0442 \\u0432\\u0441\\u0435 \\u0442\\u0430\\u043a\\u0438\\u0435 \\u0441\\u043f\\u043e\\u0440\\u043d\\u044b\\u0435 \\u0442\\u0435\\u043a\\u0441\\u0442\\u044b, \\u0447\\u0442\\u043e\\u0431\\u044b \\u0433\\u043e\\u0442\\u043e\\u0432\\u0438\\u043b\\u0441\\u044f \\u0438 \\u0432 \\u041f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u043a\\u0435 \\u0438 \\u0440\\u0435\\u0430\\u043b\\u0438\\u0437\\u0430\\u0446\\u0438\\u044f \\u043d\\u0430\\u043c\\u0435\\u0447\\u0435\\u043d\\u043d\\u044b\\u0445 \\u043f\\u043b\\u0430\\u043d\\u043e\\u0432\\u044b\\u0445 \\u0437\\u0430\\u0434\\u0430\\u043d\\u0438\\u0439 \\u043f\\u043e\\u0437\\u0432\\u043e\\u043b\\u044f\\u0435\\u0442 \\u0432\\u044b\\u043f\\u043e\\u043b\\u043d\\u0438\\u0442\\u044c \\u0432\\u0430\\u0436\\u043d\\u044b\\u0435 \\u0437\\u0430\\u0434\\u0430\\u043d\\u0438\\u0439 \\u043f\\u043e\\u0437\\u0432\\u043e\\u043b\\u044f\\u0435\\u0442 \\u043e\\u0431\\u043e\\u0439\\u0442\\u0438\\u0441\\u044c \\u0431\\u0435\\u0437 \\u043f\\u043e\\u0442\\u0435\\u0440\\u044c.\r\n\\n \\u041d\\u0443\\u0436\\u043d\\u043e \\u0434\\u0435\\u0440\\u0436\\u0430\\u0442\\u044c\\u0441\\u044f \\u043e\\u0442 \\u044d\\u0442\\u043e\\u0433\\u043e \\u0435\\u0441\\u0442\\u044c \\u0434\\u043e \\u043f\\u043e\\u043b\\u0443\\u0447\\u0430\\u043b\\u043e\\u0441\\u044c.\r\n\\n \", \"published\": \"2014-09-26T17:47:24Z\", \"id\": 249899, \"thread\": 16714, \"user\": {\"ava\": \"a2d569a1792eed88f54609e8cc97acde\", \"id\": 1438, \"name\": \"3.14159265\"}}, {\"text\": \"\r\n\\u0421\\u0442\\u0440\\u0430\\u043d\\u043d\\u044b\\u0435 \\u0443 \\u0432\\u0430\\u0441 \\u0444\\u0435\\u0442\\u0438\\u0448\\u0438.\r\n\\n \", \"published\": \"2014-09-26T16:39:20Z\", \"id\": 249892, \"thread\": 16654, \"user\": {\"ava\": \"787e4db09e7f549efecd75e189856682\", \"id\": 5528, \"name\": \"bormand\"}}, {\"text\": \"\r\n\\u041d\\u0430\\u0442\\u0435: http://bormand.tk/gktmp/\r\n\\n\\u0410 \\u044f \\u043f\\u043e\\u0439\\u0434\\u0443 \\u0441\\u043f\\u0430\\u0442\\u044c.\r\n\\n \", \"published\": \"2014-09-26T16:27:22Z\", \"id\": 249890, \"thread\": 15948, \"user\": {\"ava\": \"787e4db09e7f549efecd75e189856682\", \"id\": 5528, \"name\": \"bormand\"}}, {\"text\": \"\r\n;)\r\n\\n \", \"published\": \"2014-09-26T14:55:26Z\", \"id\": 249887, \"thread\": 16581, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\n\\u0412\\u044a\\u0435\\u0431\\u0430\\u043b \\u043c\\u0438\\u043d\\u0443\\u0441\\u0430\r\n\\n \", \"published\": \"2014-09-26T14:53:00Z\", \"id\": 249884, \"thread\": 16647, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\n\\u0427\\u0435\\u043c \\u0431\\u043e\\u043b\\u044c\\u0448\\u0435 \\u0441\\u043f\\u0430\\u043c\\u0430 - \\u0442\\u0435\\u043c \\u043b\\u0443\\u0447\\u0448\\u0435, \\u0443 \\u043c\\u0435\\u043d\\u044f \\u043e\\u0442 \\u044d\\u0442\\u043e\\u0433\\u043e \\u0432\\u043e\\u0437\\u043d\\u0438\\u043a\\u0430\\u0435\\u0442 \\u044d\\u0440\\u0435\\u043a\\u0446\\u0438\\u044f.\r\n\\n \", \"published\": \"2014-09-26T14:49:48Z\", \"id\": 249877, \"thread\": 16309, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\n\\u042d\\u0445, \\u044f \\u0431\\u044b \\u043f\\u043e\\u043a\\u0443\\u0441\\u0430\\u043b \\u0442\\u0432\\u043e\\u0439 \\u0431\\u0430\\u043d\\u0430\\u043d\\u0447\\u0438\\u043a...\r\n\\n \", \"published\": \"2014-09-26T14:47:48Z\", \"id\": 249872, \"thread\": 16451, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\n\\u0425\\u043e\\u0447\\u0443 \\u0440\\u043e\\u0434\\u0438\\u0442\\u044c \\u0434\\u0435\\u0442\\u0435\\u0439 \\u043e\\u0442 \\u0442\\u0435\\u0431\\u044f. \\u042f \\u043f\\u0430\\u0440\\u0435\\u043d\\u044c.\r\n\\n \", \"published\": \"2014-09-26T14:45:09Z\", \"id\": 249869, \"thread\": 16638, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\n\\u041c\\u043e\\u043b\\u043e\\u0434\\u0435\\u0446, \\u0434\\u0440\\u0443\\u0433! \\u041d\\u0430 \\u0440\\u0430\\u0434\\u043e\\u0441\\u0442\\u044f\\u0445 \\u044f \\u043d\\u0430\\u0433\\u0438\\u0431\\u0430\\u044e\\u0441\\u044c \\u0438 \\u043f\\u0440\\u0438\\u043f\\u0430\\u0434\\u0430\\u044e \\u043a \\u0442\\u0432\\u043e\\u0435\\u043c\\u0443 \\u0441\\u0442\\u043e\\u044f\\u0449\\u0435\\u043c\\u0443 \\u0436\\u0438\\u0432\\u0438\\u0442\\u0435\\u043b\\u044c\\u043d\\u043e\\u043c\\u0443 \\u0438\\u0441\\u0442\\u043e\\u0447\\u043d\\u0438\\u043a\\u0443.\r\n\\n \", \"published\": \"2014-09-26T14:41:25Z\", \"id\": 249867, \"thread\": 16242, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\nYou have the monopoly on useful <a href=\\\"http://jbppoznquq.com\\\">inne-mationrarof't</a> monopolies illegal? ;)\r\n\\n \", \"published\": \"2014-09-26T14:03:36Z\", \"id\": 249861, \"thread\": 15761, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\nI feel so much happier now I <a href=\\\"http://pfzesvepsx.com\\\">undtrseand</a> all this. Thanks!\r\n\\n \", \"published\": \"2014-09-26T13:58:11Z\", \"id\": 249856, \"thread\": 15851, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\n<a href=\\\"http://ohgughjv.com\\\">Th'ats</a> the best answer of all time! JMHO\r\n\\n \", \"published\": \"2014-09-26T13:57:39Z\", \"id\": 249855, \"thread\": 16549, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\nSuch an <a href=\\\"http://jpunkcylg.com\\\">imiserspve</a> answer! You've beaten us all with that!\r\n\\n \", \"published\": \"2014-09-26T13:56:43Z\", \"id\": 249854, \"thread\": 16662, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\nIf your <a href=\\\"http://pxbskiseb.com\\\">arlteics</a> are always this helpful, \\\"I'll be back.\\\"\r\n\\n \", \"published\": \"2014-09-26T13:54:22Z\", \"id\": 249851, \"thread\": 16352, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\n<a href=\\\"http://bzpfkc.com\\\">Three's</a> nothing like the relief of finding what you're looking for.\r\n\\n \", \"published\": \"2014-09-26T13:52:37Z\", \"id\": 249849, \"thread\": 16703, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\nI'll try to put this to good use <a href=\\\"http://lcwoygqdhrs.com\\\">imtileamedy.</a>\r\n\\n \", \"published\": \"2014-09-26T13:51:04Z\", \"id\": 249847, \"thread\": 16675, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\nThis <a href=\\\"http://agudrb.com\\\">intiamrfoon</a> is off the hizool!\r\n\\n \", \"published\": \"2014-09-26T13:44:51Z\", \"id\": 249845, \"thread\": 16667, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}, {\"text\": \"\r\nFour score and seven minutes ago, I read a sweet <a href=\\\"http://cbneyecls.com\\\">ariletc.</a> Lol thanks\r\n\\n \", \"published\": \"2014-09-26T13:43:17Z\", \"id\": 249844, \"thread\": 16058, \"user\": {\"ava\": null, \"id\": 1, \"name\": \"guest\"}}], \"api_version\": 1}";

  function text(t){ return document.createTextNode(t); };

  function filterInfiniteStok(comments){
    var lastComment = $('.entry-comment-wrapper a.comment-link:last')[0];
    var lastPost = $('a.entry-title:last')[0];
    
    var cid = +lastComment.href.match(/\d+$/)[0];
    var pid = +lastPost.href.match(/\d+$/)[0];
    
    for(var i=0; i<comments.length; ++i){
      var comment = comments[i];
      if(+comment.thread < pid && +comment.id < cid)
        break;
    }
    
    return i;
  }

  function postInfo(entry){
    var UID = entry.user.id;
    var PID = entry.thread;
    var PID2 = entry.thread;
    var CID = entry.id;
    var postRef = '/' + PID;
    var commName = 'comment' + CID;
    var commRef = '/' + PID + '#comment' + CID;
    var answerRef = '/comments/' + PID2 + '/post?replyTo=' + CID;
    var userRef = '/user/' + UID;
    var userName = entry.user.name;
    var time = entry.published;
    var hrtime = entry.published;
    var avatar = UID == 1 ?
      '/files/avatars/guest_28.png' :
      entry.user. 'http://www.gravatar.com/avatar/' + entry.user.ava + '?default=http%3A%2F%2Fgovnokod.ru%2Ffiles%2Favatars%2Fnoavatar_28.png&amp;r=pg&amp;size=28';
    var commText = entry.text;

    return $('<li/>', {'class': "hentry"})
      .append($('<h2/>', { text: 'Комментарий к ' })
        .append($('<a/>', {rel: "bookmark", 'class': "entry-title", href: postRef, text: 'говнокоду #' + PID})))
      .append($('<div/>', {'class': "entry-comments"})
        .append($('<ul/>')
          .append($('<li/>', {'class': "hcomment"})
            .append($('<div/>', {'class': "entry-comment-wrapper"})
              .append($('<p/>', {'class': "entry-info"})
                .append($('<img/>', {'class': "avatar", src: avatar, alt: "ava", title: "Аватар"}))
                .append($('<strong/>', {'class': "entry-author"})
                  .append($('<a/>', {href: userRef, text: userName})))
                .append($('<abbr/>', {'class': "published", title: time, text: hrtime}))
                .append($('<a/>', {href: commRef, name: commName, title: "Ссылка на комментарий", 'class': "comment-link", text: '#'})))
              .append($('<div/>', {'class': "entry-comment", text: commText}))
              .append($('<a/>', {'class': "answer", href: answerRef, text: 'Ответить'}))))));
  }

  function stokElement(){ return $('ol.posts'); }

  function message(type, color, t){
    return $('<li/>', {'class': "hentry", style: 'background-color: ' + color })
      .append($('<h2/>', { text: type, style: 'color: #444' }))
      .append(text(t));
  }
  
  function error(t){ return message('Ошибка', '#fcc', t); }
  function warning(t){ return message('Предупреждение', '#ffc', t); }

  function appendPosts(stok){
    if(stok.api_version != 1) {
      stokElement().append(error('Борманд сменил версию API. Было 1, стало ' + stok.api_version));
      return;
    }

    var i = filterInfiniteStok(stok.comments);
    var fragment = document.createDocumentFragment();
        
    if(i >= stok.comments.length)
      fragment.appendChild(warning('Возможно, сток порван.')[0]);
    
    for(; i< stok.comments.length; ++i)
      fragment.appendChild(postInfo(stok.comments[i])[0]);
    
    stokElement().append(fragment);
  }
  
  function onLBClick(event){
    $(this).remove();
    
    stokElement().append($('<li/>', {id: 'infinite-stok-loading', 'class': "hentry", style: 'background-color: #cfc' })
      .append($('<h2/>', { text: 'Бесконечный сток', style: 'color: #444' }))
      .append(text('Загружается.')));
    
    $.ajax({
      url: "http://bormand.tk/gkapi/latest",
      cache: false,
      success: function(data){
        console.log('data:',data);
        try {
          appendPosts(JSON.parse(data.replace(/[\r\n]/g,'')));
        } catch(e){
          // appendLoadButton();
          
          stokElement()
            .append(error('Далее информация берётся из кэшированной копии.'))
            .append(warning('Борманду надо запилить заголовок "Access-Control-Allow-Origin: http://govnokod.ru", иначе это всё - питушня.'));
          
          appendPosts(JSON.parse(tmpData.replace(/[\r\n]/g,'')));
        }
        $('#infinite-stok-loading').remove();
      },
      error: appendLoadButton
    });
  }
    
  function appendLoadButton(){
    stokElement().append($('<li/>', {'class': "hentry", style: 'background-color: #cfc' })
      .append($('<h2/>', { text: 'Бесконечный сток', style: 'color: #444' }))
      .append('<a href="#">Хочу ещё! Загрузите мне бесконечный сток!</a>')
      .click(onLBClick)
    )
  }
  
  appendLoadButton();

})();