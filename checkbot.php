<?php
/**
 * SendItEaseCommentAntiSpam
 *
 * FINAL ARCHITECTURE:
 * - Plugin decides ONLY: bot or human
 * - Business logic (moderation / auto-publish) is handled by easeComment snippet
 *
 * Events:
 *  - OnBeforeEcMessageSave
 *  - OnBeforeEcReplySave
 */

if (!defined('MODX_BASE_PATH')) {
    return;
}

/** @var modX $modx */
$eventName = $modx->event->name;

// ---------------------------
// Optional logging
// ---------------------------
$logEnabled = (int)$modx->getOption('ec_sendit_log', null, 0) === 1;
//$logEnabled = 0;

$log = function(string $msg) use ($modx, $logEnabled) {
    if ($logEnabled) {
        $modx->log(modX::LOG_LEVEL_ERROR, '[SendItEaseComment] ' . $msg);
    }
};

// ---------------------------
// Get message / reply object
// ---------------------------
$params = $modx->event->params ?? [];
$obj = $params['message']
    ?? $params['reply']
    ?? $params['object']
    ?? $params['obj']
    ?? null;

// If object not found — do nothing
if (!$obj) {
    $log("No object in event {$eventName}");
    return;
}

// ---------------------------
// Admin bypass
// ---------------------------
if ($modx->user && $modx->user->hasSessionContext('mgr')) {
    $log('Admin bypass');
    return;
}

// ---------------------------
// Read SendIt cookie
// ---------------------------
$sendItRaw = $_COOKIE['SendIt'] ?? '';

if ($sendItRaw === '') {
    // No SendIt = suspicious → reject
    $log('Reject: no SendIt cookie');
    return $modx->event->output(
        'Если вы не робот — перезагрузите страницу!'
    );
}

$sendIt = json_decode(urldecode($sendItRaw), true);
if (!is_array($sendIt)) {
    $log('Reject: SendIt cookie JSON decode failed');
    return $modx->event->output(
        'Если вы не робот — перезагрузите страницу!'
    );
}

// ---------------------------
// Read behavioral data (siubt)
// ---------------------------
$ubtRaw = $sendIt['siubt'] ?? null;
$ubt = null;

if (is_string($ubtRaw) && $ubtRaw !== '') {
    $ubt = json_decode($ubtRaw, true);
    if (!is_array($ubt)) {
        $ubt = json_decode(urldecode($ubtRaw), true);
    }
} elseif (is_array($ubtRaw)) {
    $ubt = $ubtRaw;
}

$isBot = (bool)($ubt['isBot'] ?? false);
$score = $ubt['score'];

$log('UBT: isBot=' . ($isBot ? '1' : '0') . ' score=' . $score);

// ---------------------------
// FINAL DECISION
// ---------------------------

// 🤖 BOT → REJECT
if ($isBot === true) {
    $log('REJECT: bot detected');
    return $modx->event->output(
        'Если вы не робот — перезагрузите страницу!'
    );
}

// 👤 HUMAN → PASS (let easeComment decide moderation)
$log('PASS: human detected');
// return $modx->event->output(
//         'дошел до конца!'
//     );
return;
