# easyComment_Sendit_antispam
Интеграция антиспама в easyComment на основе поведенческих факторов собранных Sendit

# Дополнительные функции для easyComments
1) вместо ec.js  настройках выбрать этот скрипт
2) заменить 3 чанка на указанные и вызвать их так
<div class="itemComments">
           <div class="itemHeader">
        	    <h3>Комментарии</h2>
        	</div>
        	<div class="wrap">
        	    {'!ecReplyForm' | snippet: [
        	        'thread' => 'YurAdres-'~$_modx->resource.id,
        	        'tplForm' => 'customtpl.ecReplyForm'
        	    ]}
        	    {'!ecMessages' | snippet: [
        	        'votingEnable' => 1,
        	        'votingAllowGuest' => 1,
        	        'votingConsiderIP' => 1,
        	        'limit' => 100,
        	        'repliesEnable' => 1,
        	        'thread' => 'YurAdres-'~$_modx->resource.id,
        	        'sortby' => 'created_on',
                    'sortdir' => 'ASC',
        	        'tpl' => 'custom.tpl.ecMessages'
        	    ]}
        	    
        	    {'!ecForm' | snippet : [
        	        'thread' => 'YurAdres-'~$_modx->resource.id,
        	        'tplForm' => 'customtpl.ecForm'
        	        
        	    ]}
        	</div>
        </div>
3) подключить свои стили CSS вместо тех что по умолчанию


// изменения:
// 1) выпилил рейтинг и файлы - мне они ни к чему
// 2) добавил обработку мультивложенности ответов - добавяляет классы вложенности на основе parent_id
// 3) добавляет имя кому отвечаем
// 4) следит за временем публикации - 5 мин назад, 1 час назад, вчера, а если позже 2 дней то просто дата
// 5) добавил смайлики
// 6) добавил кнопку цитирования
// 7) добавил счетчик максимум 1000 символов
