<?php
/**
 * ecQuoteParse
 * - убирает <br> от easyComments
 * - корректно парсит [quote]
 * - не дублирует переносы
 * - безопасен
 */

$text = (string)($scriptProperties['text'] ?? '');
$text = trim($text);

if ($text === '') {
    return '';
}

/* 1. Декодируем HTML-сущности */
$text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

/* 2. УБИРАЕМ все <br>, которые пришли из easyComments */
$text = preg_replace('~<br\s*/?>~i', "\n", $text);

/* 3. Нормализуем переносы строк */
$text = str_replace(["\r\n", "\r"], "\n", $text);

/* 4. Парсим цитаты */
$text = preg_replace_callback(
    '~\[quote=(.*?)\]\s*(.*?)\s*\[/quote\]~is',
    function ($m) {
        $author = htmlspecialchars(trim($m[1]), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $body   = htmlspecialchars(trim($m[2]), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        return
            '<blockquote class="ec-quote">' .
                '<strong>' . $author . ' писал:</strong>' .
                '<div class="ec-quote__body">' .
                    nl2br($body, false) .
                '</div>' .
            '</blockquote>';
    },
    $text
);

/* 5. Защищаем blockquote */
$placeholders = [];
$text = preg_replace_callback(
    '~<blockquote class="ec-quote">.*?</blockquote>~is',
    function ($m) use (&$placeholders) {
        $key = '__EC_QUOTE_' . count($placeholders) . '__';
        $placeholders[$key] = $m[0];
        return $key;
    },
    $text
);

/* 6. Экранируем остальной текст */
$text = htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

/* 7. Возвращаем blockquote */
foreach ($placeholders as $key => $html) {
    $text = str_replace($key, $html, $text);
}

/* 8. Переносы строк СНАРУЖИ цитаты */
$text = nl2br($text, false);

return $text;
