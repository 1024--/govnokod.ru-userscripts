### Юзерскрипты для Говнокод.ру
Позволят вам стать немножечко счастливее.  
Список скриптов от пользователей ГК смотрите [на форуме](http://gvforum.ru/viewtopic.php?id=1173).

Пользователю потребуется относительно свежий браузер Firefox или Chrome с установленным расширением для исполнения скриптов. Для Firefox - [Greasemonkey](https://addons.mozilla.org/ru/firefox/addon/greasemonkey/), для Chrome - [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).

#### [gQuery](gquery.user.js)
  Скрипт инициализирует плагин к jQuery, добавляющий конструкцию $(...).gk(...) для более удобной работы со страницами ГК.

#### [Улучшенная навигация по комментариям](gc_new_comments.user.js)
  Скрипт реализует перемещение по новым/соседним/всем комментариям по хоткеям;
  перемещение в порядке по дате/положению комментария на странице;
  древовидное представление поста (опционально).

#### [Подсветка новых комментариев](highlight-new.user.js)
  Скрипт подсвечивает непрочитанные комментарии. Работает в гостевом режиме,
  а также если подсветка новых комментариев на ГК сломана. Данные сохраняются
  в localStorage.

#### [Продвинутый скрипт для фильтрации ГК от спама](GKFilter.user.js)
  Моя модификация версии 3.2.0 [скрипта](http://userscripts.org/scripts/source/393166.user.js)
  пользователя Vindicar (добавлена поддержка Chrome).
  Скрипт умеет скрывать, убирать под спойлер посты/комментарии,
  создавать группы пользователей, для которых совершаются разные действия.

#### [Скрипт для скрытия неугодных пользователей](ignore_users.user.js)
  Скрипт добавляет ссылку "забанить" к комментариям пользователя.
  Позволяет скрывать комментарии выбранных пользователей
  как HTML-ноды (полностью) либо прикрывать спойлером ГК.
  Требует для работы [gQuery](gquery.user.js)
  (В Greasemonkey/Tampermonkey стоит запускать gQuery перед этим скриптом).

#### [Вставка BB-кодов](bbcode.user.js)
  Скрипт позволяет вставлять BB-коды в текст комментария. Поддерживается
  "окружение" тегами выделенного текста. Свои кнопки добавить очень легко,
  чуть изменив скрипт.

#### [Бесконечный сток Борманда](infinite_stok.user.js)
  Скрипт добавляет в конец стока добавляет зелёную область, по нажатию на которую
  к стоку ГК добавляется [бесконечный сток](http://bormand.tk/gktmp/) Борманда.

#### [Посты с главной - в стоке](main_vs_stok.user.js)
  Скрипт подгружает в фоне главную страницу (последние 10 постов) и добавляет в сток те посты, которые не были упомянуты в стоке, но находятся на главной.

#### [Всплывающий родительский комментарий](gc_parent_comment_2.user.js)
  [Оригинальный скрипт](http://govnokod.ru/13321) "добавляет ссылку на родительский комментарий, и ставит его текст как тултип" (Vindicar).  
  Изменённый 1024-- скрипт показывает сам комментарий вместо его текста.

#### [Кнопка "Выполнить" для JavaScript](execjs.user.js)
  Скрипт добавляет под говнокод на JavaScript кнопку "Выполнить", делая говнокод редактируемым.

#### [Отслеживание изменившихся постов](gc_log_posts.user.js)
  Скрипт добавляет в кабинку пользователя список изменившихся постов с некоторого момента
  (полезно для отслеживания изменений для последующей их единовременной загрузки).  
  Для отслеживания сиюминутных изменений воспользуйтесь [скриптом Кегдана](https://github.com/Kegdan/Jabiy-Scrip/blob/master/NewInGovnokod.js).

#### [Кто такой - этот пользователь?](who.user.js)
  Скрипт пишет в кабинке выбранного пользователя информацию о нём.
  (Количество постов, комментариев, оценки, активность, адекватность...)   
  Информация о пользователе хранится в теле скрипта и отражает ситуацию на момент обработки постов с участием пользователя.

#### [Генерация бреда](autobred.user.js)
  Скрипт добавляет ссылку "ответить бредом", по клику по которой появляется форма ответа на комментарий и заполняется бредом, сгенерированным автоматически из содержания комментариев.   
  Алгоритм реализовал inkanus-gray.
  Подробнее о генераторе - в теме [шизофазия на ГК](http://gvforum.ru/viewtopic.php?id=1203)

#### [Портированный Натализационный ворецианизатор текстов](gost-vorec.user.js)
  Скрипт добавляет ссылку "Вореционизировать" после надписи вида "Где здесь C++".
  После этого текст комментария изменяется под действием [алгоритма v.0.2.1](http://gvforum.ru/viewtopic.php?pid=2372#p2372).
  Алгоритм реализовал gost.
  
#### [Псевдографические псевдогифки](goatgif.user.js)
  Скрипт пытается интерпретировать комментарии на ГК как скрипты на встроенном языке генерации анимации.   
  Описание языка занимает мало места и располагается в файле со скриптом.
  
  Пример анимации с "мигающим курсором":

    GOATGIF:1
    (= h 'hello')
    (@
      (= x (- 1 x))
      (show h (if x (shift (width h) 0 '_'))))

#### [Приватный чатик](cryptochat.user.js)
  Скрипт позволяет добавлять в комментарии секретные сообщения. Шифрование симметричное (AES, 256b). Работает обмен ключами (Diffie-Hellman, 2048b).

#### [Случайные фразы](bump.user.js)
  Скрипт создаёт кнопку "bump", при нажатии которой открывается поле ввода комментария, куда вставляется специально сформированное предложение. Забудьте об унылых комментариях с текстом "бамп" или "ап", используйте современные средства!