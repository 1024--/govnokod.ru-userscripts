// ==UserScript==
// @name Шифрованный чат
// @namespace govnokod
// @include http://govnokod.ru/*
// @include http://www.govnokod.ru/*
// @version 0.0.10
// @grant none
// ==/UserScript==

// см. настройки на панели настроек пользователя
// там можно выбрать и настроить ключ и т.п.

(function(){
  
  var ID = 'dbdf6b41-e08a-4046-809f-50f513fd0756';
    
  function SumHandler(n, cb) {
    return function(){
      console.log('SumHandler: ' + (n-1));
      if(!--n) cb();
    };
  }
  
  function loadScript(url, sumHandler) {
    var script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
    
    script.addEventListener('load', sumHandler);
    script.addEventListener('error', function(){
      setTimeout(function(){
        loadScript(url, sumHandler);
      }, 1000);
    });
  }
  
  function checksum(text) {
    var cs = 0;
    for(var i=0; i<text.length; ++i) {
      cs *= 109;
      cs += text.charCodeAt(i);
    }
    
    var s = (cs % 0xffff).toString(16);
    while(s.length < 4) s = '0' + s;
    return s;
  }
  
  checksum.LENGTH = 4;
  
  function Key(str) {
    var m = str.match(/^(?:\(([^)]*)\))?(.+)$/);
    if(!m) {
      alert('Неправильная строка с ключом: "' + str + '"');
      m = ['','неверный ключ', ''];
    }
    this.key = CryptoJS.enc.Hex.parse(m[2]);
    this.name = m[1];
  }
  
  Key.prototype.toString = function(){
    return this.name ? this.name : 'Ключ ' +
      String(CryptoJS.MD5(this.key)).substr(0,16);
  };
  
  // AES:версия:IV:сумма:сообщение
  function decrypt(text, keys) {
    if(!/^\[?AES:/.test(text)) return null;
    text = text.replace(/\s+/g, '').replace(/^\[(.+)\]$/, '$1');
    var m = text.match(/^AES:(.+?):(.+?):(.+)$/);
    if(!m) return null;
    
    var ver = m[1];
    
    if(Number(ver) !== 1) return null;
    var iv = CryptoJS.enc.Hex.parse(m[2]);
    var msg = m[3];

    // console.log('INFO [' + ver + ' ' + iv + ' ' + ' ' + msg + ']');
    
    for(var i=0; i<keys.length; ++i) {
      var decrypted;
      try {
        decrypted = CryptoJS.AES.decrypt(msg, keys[i].key, { iv: iv }).toString(CryptoJS.enc.Utf8);
      } catch(e) {
        continue;
      }
      var cs = decrypted.substring(0, checksum.LENGTH);
      decrypted = decrypted.substring(checksum.LENGTH);
      // console.log('DECR [' + decrypted + ']');
      if(checksum(decrypted) === cs) return {text: decrypted, key: keys[i]};
    }
    
    return null;
  }
  
  function encrypt(text, key) {
    var iv_txt = createKey(key.key.sigBytes * 8);
    var iv = CryptoJS.enc.Hex.parse(iv_txt);
    
    return '[AES:1:' + 
      iv_txt + ':' +
      String(CryptoJS.AES.encrypt(checksum(text) + text, key.key, { iv: iv })) +
      ']';
  }
  
  function createKey(N){
    if(!N) N = 256;
    N = N / 8 | 0;
    var arr = new Uint8Array(N);
    crypto.getRandomValues(arr);
    var key = '';
    for(var i=0; i<N; ++i) {
      if(arr[i] < 0x10) key += '0';
      key += arr[i].toString(16);
    }
    return key;
  }
  
  var keys, currentKey, DHkey, DHprime, Dhgen;
  var options = {};
  
  function reloadKeys() {
    keys = loadKeys().split(':').map(function(key){
      return new Key(key);
    });

    currentKey = keys[0];
        
    updateKeySelector();
  }
  
  function saveKeys(keys_) {
    localStorage.setItem(ID + 'keys', keys_);
  }

  function loadKeys() {
    return localStorage.getItem(ID + 'keys') || '';
  }
  
  function reloadDHKey() {
    DHkey = str2bigInt(loadDHKey(), 16, 2048, 256);
  }
  
  function loadDHKey() {
    return localStorage.getItem(ID + 'DHkey');
  }
  
  function saveDHKey(key) {
    localStorage.setItem(ID + 'DHkey', key);
  }

  function coolSplit(str, pattern) {
    var result = [];
    while(1){
      var m = str.match(pattern);
      if(!m) {
        if(str) result.push(str);
        return result;
      }
      if(m.index) result.push(str.substr(0, m.index));
      result.push(str.substr(m.index, m[0].length));
      str = str.substr(m.index + m[0].length);
    }
  }
  
  function decryptComments() {
    $('span.comment-text').each(function(){
      var $this = $(this);
      var text = $this.text();
      if(!/AES:/.test(text)) return;
      $this.empty();
      coolSplit(text, /\[AES:.+?\]|\n|^AES:.+$/).forEach(function(part, i) {
        if(part === '\n') {
          $this.append('<br/>');
          return;
        }
        if(!/^\[?AES:.+?:/.test(part)) {
          $this.append(document.createTextNode(part));
          return;
        }
        
        var decr = decrypt(part, keys);
        
        if(decr == null) {
          $('<span style="color: ' + options['decr-color'] + '">██████</span>')
            .attr('title', 'исходный текст: "' + part + '"')
            .appendTo($this);
          if(options['show-key-name'] != '0')
            $this.append($('<sup style="color: ' + options['key-color'] +
              '">нет ключа</sup>'));
        } else {
          $('<span style="color: ' + options['decr-color'] + '"></span>')
            .attr('title', 'расшифровано с помощью "' + decr.key + '"')
            .text(decr.text)
            .appendTo($this);
          if(options['show-key-name'] != '0')
            $this.append($('<sup style="color: ' + options['key-color'] +
              '">' + decr.key +'</sup>'));
        }
      });
    });
  }
  
  var keySelector = null;
  
  function updateKeySelector() {
    if(!keySelector) return;
    if(keys[0] !== currentKey) currentKey = keys[0];
    
    keySelector.empty();
    keys.forEach(function(k, i) {
      keySelector.append('<option value="' + i + '" ' + (i?'':'selected') +
        '>' + k + '</option>');
    });
  }
  
  function reloadOptions(){
    var defaults = {
      'key-color': '#ccc',
      'decr-color': '#8080ff',
      'show-key-name': '1',
    };
    
    for(var n in defaults)
      if(defaults.hasOwnProperty(n))
        options[n] = defaults[n];
    
    (localStorage.getItem(ID + 'options') || '').split(/\s*,\s*/).forEach(function(prop){
      var p = prop.split('=');
      if(p.length != 2) return;
      options[p[0]] = p[1];
    });
  }
  
  function getOptions(){
    var opts = [];
    for(var n in options)
      if(options.hasOwnProperty(n))
        opts.push(n + '=' + options[n]);
    return opts.join(',');
  }
  
  function saveOptions(opts) {
    localStorage.setItem(ID + 'options', opts);
  }
  
  function appendPanel() {
    var comment = $('textarea#formElm_text');
    var info = comment.parent();

    if(!comment.length || !info.length) return;
    if(info.find('div.userscript-1024--cryptochat').length) return;
    var container = $('<div class="userscript-1024--cryptochat"></div>');
    
    function transformField(func) {
      var start = comment.attr('selectionStart'), end = comment.attr('selectionEnd');
      var val = comment.val();
      comment.val(start === end ? func(val) :
        val.substring(0, start) + func(val.substring(start, end)) +
        val.substring(end));
    }
    
    var encButton = $('<a href="#">[зашифровать]</a>').click(function(event){
      transformField(function(x){ return encrypt(x, currentKey); });
      event.preventDefault();
    });
    
    var decButton = $('<a href="#">[расшифровать]</a>').click(function(event){
      transformField(function(x){
        var decr = decrypt(x, keys);
        return decr != null ? decr.text : x;
      });
      event.preventDefault();
    });
    
    var DH1Button = $('<a href="#">[DH:вставить]</a>').click(function(event){
      var publicKey = powMod(DHgen, DHkey, DHprime);
      comment.val(comment.val() + '[DHKEY:1:' + bigInt2str(publicKey, 16) + ']');
      event.preventDefault();
    });
    
    var DH2Button = $('<a href="#">[DH:принять]</a>').click(function(event){
      var s = window.getSelection(), keyString = String(s), publicKey, keyComment = 'DH|new-key';
      
      if(!keyString) {
        publicKey = prompt('Введите публичный ключ того, с кем хотите поговорить.\n' +
          'Вы также можете выделить текст его комментария с ключом, ' +
          'чтобы была захвачена строка вида [DHKEY:1:PITUX] и снова нажать на [DH|принять].');
        if(publicKey == null) return false;
        publicKey = publicKey.replace(/^DHKEY:.+?:|\s+/g, '');
      } else {
        var m = keyString.match(/\[DHKEY:(.+?):([A-Fa-f0-9\s]+)\]/);
        if(!m) {
          alert('Ключ не найден. Захватите выделением строку вида [DHKEY:1:PITUX]');
          return false;
        }
        if(m[1] != '1') {
          alert('Неизвестная версия ' + m[1] + '.');
          return false;
        }
        publicKey = m[2].replace(/\s+/g, '');

        var comment = $(s.anchorNode).closest('div.entry-comment-wrapper');
        if(comment.length)
          keyComment = 'DH|' + comment.find('.entry-author>a').text();
      }
      
      var secret = powMod(str2bigInt(publicKey, 16, 2048, 256), DHkey, DHprime);
      var salt = CryptoJS.lib.WordArray.create();
      var key = CryptoJS.PBKDF2(bigInt2str(secret, 16), salt, { keySize: 256/32 }).toString();
      
      key = prompt('Такой ключ будет добавлен в список ключей для шифрования.\n' +
      'Вы можете отредактировать ключ или его описание.\n' +
      'Или нажать Esc для отмены добавления.', '(' + keyComment + ')' + key);
      if(key == null) return false;
      saveKeys(loadKeys() + ':' + key);
      reloadKeys();
      
      return false;
    });

    keySelector = $('<select></select>').change(function(){
      var v = Number(keySelector.val());
      if(v < 0 || v >= keys.length) {
        alert('Неверный номер ключа. Меню выбора не синхронизовано.');
        return;
      }
      currentKey = keys[v];
    });
    
    updateKeySelector();
    
    container
      .append(encButton)
      .append('  ')
      .append(decButton)
      .append('  ')
      .append(DH1Button)
      .append('  ')
      .append(DH2Button)
      .append('  ')
      .append(keySelector)
      .appendTo(info);
  }
  
  function init() {
    
    if(!loadKeys()) saveKeys('(automatic)' + createKey());
    if(!loadDHKey()) saveDHKey(createKey(2048));
    reloadKeys();
    reloadDHKey();
    reloadOptions();
    appendPanel();
    decryptComments();
    
    showKeyName = localStorage.getItem(ID + 'show-name');
    keyColor = localStorage.getItem(ID + 'key-color');
    decryptedColor = localStorage.getItem(ID + 'decr-color');
    
    $('a.answer, h3>a').live('click', appendPanel);
    $(document).ajaxComplete(appendPanel).ajaxComplete(decryptComments);
    
    DHgen = int2bigInt(2, 8, 1);
    DHprime = str2bigInt(
      'd7efdf8bcb081bb53f0ab2b1621c91e0b181f78f83fc9aafc1f71fa7236311a3' +
      '065a2ebbc456944ce34c9d2f9fef770a7828c46dd855ff32a1c4feb00e748fe2' +
      '0ccb4d0b7f0eb0f6d4f27a7bdb904052786829810e8e8101bcf4ec2a76896c37' +
      '7f5f5751e3675c019ef7e477f682f63596eeb0453ac5cdd09c07528c296362d4' +
      '9ce3779a6afad9cb2f3d569a32f0a39273f0721ac90cd05933734826147314b6' +
      '0e8dc792ceef446b0247adf94270264f6f72cc52ce77f16657d07c8c231a0b4e' +
      '1aeb0756e5caf1930b01b3f019875f57007f39e1f62182c5b081b7f3b1435904' +
      '2b3b153297afcce5ecb4d8f5fb792b1f7b6f6e314d1375627374f8a8a838d76b',
      16, 2048, 256
    );

    // (c)пёрто из https://github.com/bormand/govnokod-board/
    var configDialog = $("<li><div><p>Настройки шифрования:</p></div></li>")
      .appendTo($('#userpane > .pane-content > ul'));
    
    configDialog.append($('<a href="#">Новый ключ AES</a>')
      .click(function(event){
        var key = createKey();
        key = prompt('Новый ключ для зашифрованной переписки.\n' +
          'Введите свой, если требуется изменить.\n' +
          'Или нажмите Esc для отмены.\n' +
          'Можно оставить комментарий перед ключом в скобках.\n' +
          'Новый ключ станет текущим ключом.\n', '(new)' + key);
        if(key == null) return false;
        var ks = loadKeys();
        ks = ks ? key + ':' + ks : key;
        saveKeys(ks);
        reloadKeys();
        return false;
      }));
      
    configDialog.append('<br/>');

    configDialog.append($('<a href="#">Управление ключами AES</a>')
      .click(function(event){
        var ks = prompt('Мои ключи для зашифрованной переписки.\n' +
          'Отредактируйте список (разделены через ":").\n' +
          'Можно оставить комментарий перед ключами в скобках.\n' +
          'Первый ключ станет ключом по умолчанию.\n' +
          'Или нажмите Esc для отмены.', loadKeys());
        if(ks == null) return false;
        saveKeys(ks || saveKeys('(automatic)' + createKey()));
        reloadKeys();
        return false;
      }));
    
    configDialog.append('<br/>');

    configDialog.append($('<a href="#">Приватный ключ D-H</a>')
      .click(function(event){
        var key = prompt('Мой приватный ключ для обмена ключами.\n' +
          'Отредактируйте приватный ключ или нажмите Esc для отмены.', loadDHKey());
        if(key == null) return false;
        saveDHKey(key);
        reloadDHKey();
        return false;
      }));
    
    configDialog.append('<br/>');

    configDialog.append($('<a href="#">Опции</a>')
      .click(function(event){
        var opts = prompt('Введите опции или нажмите Esc для отмены.\n' +
        'Опции обновятся после перезагрузки страницы.', getOptions());
        if(opts == null) return false;
        saveOptions(opts);
        reloadOptions();
        return false;
      }));
    
  }
  
  var handler = SumHandler(3, init);
  loadScript('http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/aes.js', handler);
  loadScript('http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/pbkdf2.js', handler);
  loadScript('http://leemon.com/crypto/BigInt.js', handler);

})();