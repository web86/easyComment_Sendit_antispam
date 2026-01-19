// вместо ec.js  настройках выбрать этот скрипт
// изменения:
// 1) выпилил рейтинг - мне он ни к чему
// 2) добавил обработку мультивложенности ответов - добавяляет классы вложенности на основе parent_id
// 3) добавляет имя кому отвечаем
// 4) следит за временем публикации - 5 мин назад, 1 час назад, вчера, а если позже 2 дней то просто дата

"use strict";

let easyComm = {
    selectors: {
        form: 'form.ec-form',
        replyForm: 'form.ec-reply-form',
        agree: 'input[name="agree"]',
        submit: 'input[type="submit"]',
        inputParent: '.ec-input-parent',
    },
    classes: {
        displayNone: 'ec-d-none',
        hasError: 'has-error'
    },

    initialize: function () {
        easyComm.message.initialize();
        easyComm.reply.initialize();
        easyComm.agree.initialize();
        // кастом
        easyComm.custom.refresh();
        setInterval(easyComm.custom.updateTimes, 60000);
    },

    message: {
        initialize: function () {
            document.querySelectorAll(easyComm.selectors.form).forEach(function (form) {
                // Обработчик отправки формы
                form.addEventListener('submit', function (e) {
                    easyComm.message.send(form);
                    e.preventDefault();
                    return false;
                });
            });
            // Обработчик голосования
            document.querySelectorAll('.js-ec-vote-button').forEach(function (el) {
                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    let btn = e.target || e.srcElement;
                    easyComm.message.vote(btn);
                });
            });
        },
        send: function (form) {
            // предварительно очищаем форму (ошибки)
            form.querySelector(easyComm.selectors.submit).setAttribute('disabled', 'disabled');
            form.querySelectorAll('.' + easyComm.classes.hasError).forEach(function (el) { el.classList.remove(easyComm.classes.hasError); });
            form.querySelectorAll('.ec-error').forEach(function (el) { el.innerHTML = ""; el.classList.add(easyComm.classes.displayNone); });

            let formData = new FormData(form);
            formData.append('action', 'message/create');

            let xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.onreadystatechange = function () {
                if (xmlHttpRequest.readyState === XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
                    if (xmlHttpRequest.status === 200) {
                        let response = JSON.parse(xmlHttpRequest.responseText);
                        let fid = form.id;
                        form.querySelector(easyComm.selectors.submit).disabled = false;
                        if (response.success) {
                            form.reset();
                            if (typeof (response.data) == "string") {
                                document.getElementById(fid + '-success').innerHTML = response.data;
                                form.classList.add(easyComm.classes.displayNone);
                            
                                easyComm.custom.refresh(document.getElementById(fid + '-success'));
                            }
                            else {
                                easyComm.notice.show(response.message);
                            }
                        }
                        else {
                            if (response.data && response.data.length) {
                                for (let i = 0; i < response.data.length; i++) {
                                    let error = response.data[i];
                                    let inputEl = form.querySelector('[name="' + error.field + '"]');
                                    if(inputEl) {
                                        let inputGroup = inputEl.closest(easyComm.selectors.inputParent);
                                        if (inputGroup) {
                                            inputGroup.classList.add(easyComm.classes.hasError);
                                        }
                                    }
                                    let errorEl = form.querySelector('#' + fid + '-' + error.field + '-error');
                                    if (errorEl) {
                                        errorEl.innerHTML = error.message;
                                        errorEl.classList.remove(easyComm.classes.displayNone);
                                    }
                                }
                            } else {
                                easyComm.notice.error(response.message);
                            }
                        }
                    }
                    else {
                        easyComm.notice.error('Submit error');
                        form.querySelector(easyComm.selectors.submit).disabled = false;
                    }
                }
            };

            xmlHttpRequest.open("POST", easyCommConfig.actionUrl, true);
            xmlHttpRequest.send(formData);
        },
        vote: function (btn) {
            if (btn.getAttribute("data-locked")) {
                return;
            }
            let messageId = btn.closest('.ec-message__votes').getAttribute('data-message-id');
            let value = btn.getAttribute('data-value');
            let propertiesKey = btn.closest('.ec-message__votes').getAttribute('data-properties-key');

            // блокируем от повторного нажатия
            btn.setAttribute('data-locked', 'true');

            // отправляем запрос при голосовании
            let data = [];
            data.push("action=" + encodeURIComponent("message/vote"));
            data.push("messageId=" + encodeURIComponent(messageId));
            data.push("propertiesKey=" + encodeURIComponent(propertiesKey));
            data.push("value=" + encodeURIComponent(value));

            data = data.join("&");

            let xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.onreadystatechange = function () {
                if (xmlHttpRequest.readyState === XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
                    if (xmlHttpRequest.status === 200) {
                        let response = JSON.parse(xmlHttpRequest.responseText);
                        if (response.success) {
                            let wrapper = btn.closest('.ec-message__votes');
                            wrapper.querySelectorAll('.js-ec-vote-button').forEach(function (el) { el.classList.remove("active"); });
                            wrapper.querySelector('.js-ec-vote-button[data-value="1"]').innerHTML = response.data.likes;
                            wrapper.querySelector('.js-ec-vote-button[data-value="-1"]').innerHTML = response.data.dislikes;
                            wrapper.querySelector('.js-ec-vote-bar').style.width = response.data.votes_rating_percent + '%';
                            if (response.data.value) {
                                wrapper.querySelector('.js-ec-vote-button[data-value="' + response.data.value + '"]').classList.add('active');
                            }
                        }
                        else {
                            easyComm.notice.error(response.message);
                        }
                        btn.removeAttribute('data-locked');
                    }
                    else {
                        easyComm.notice.error('Request error');
                        btn.removeAttribute('data-locked');
                    }
                }
            };

            xmlHttpRequest.open("POST", easyCommConfig.actionUrl, true);
            xmlHttpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xmlHttpRequest.send(data);
        }
    },

    reply: {
        initialize: function () {
            // Обработчик отправки формы ответа
            document.querySelectorAll(easyComm.selectors.replyForm).forEach(function (form) {
                form.addEventListener('submit', function (e) {
                    easyComm.reply.send(form);
                    e.preventDefault();
                    return false;
                });
            });

            // Обработка клика по кнопка "Ответить". Показывает форму ответа.
            document.querySelectorAll('.js-ec-reply').forEach(function (el) {
                el.addEventListener('click', function (event) {
                    event.preventDefault();
                    let replyLink = event.currentTarget;
                    let thread = replyLink.dataset.ecThread;
                    let message = replyLink.dataset.ecMessage;
                    let parent = replyLink.dataset.ecParent;
                    let replyFormId = 'ec-reply-form-' + thread;
                    let replyForm = document.getElementById(replyFormId);

                    if (replyForm) {
                        // Установим значения для скрытых полей формы (на какое сообщение отвечаем)
                        replyForm.querySelector('input[name="message_id"]').value = message;
                        replyForm.querySelector('input[name="parent_id"]').value = parent ? parent : "";
                        // Покажем все скрытые ссылки "Ответить", которые относятся к текущей цепочке
                        document.querySelectorAll('.js-ec-reply[data-ec-thread="' + thread + '"]').forEach(function (el) {
                            el.classList.remove(easyComm.classes.displayNone);
                        });
                        // Скроем ссылку "Ответить", по которой кликнули
                        replyLink.classList.add(easyComm.classes.displayNone);
                        // Покажем форму ответа после текущего сообщения
                        let authorEl;
                        if(parent) {
                            replyLink.closest('.ec-reply').after(replyForm);
                            authorEl = replyLink.closest('.ec-reply').querySelector('.ec-reply__author');
                        } else {
                            replyLink.closest('.ec-message').after(replyForm);
                            authorEl = replyLink.closest('.ec-message').querySelector('.ec-message__author');
                        }
                        let textInput = replyForm.querySelector('[name="text"]');
                        if(textInput) {
                            if(authorEl) {
                                textInput.value = authorEl.innerText + ", ";
                            } else {
                                textInput.value = '';
                            }
                            // без setTimeout фокус зачастую не устанавливается
                            setTimeout(function(){textInput.focus();}, 250);
                        }

                        replyForm.classList.remove(easyComm.classes.displayNone);
                    } else {
                        easyComm.notice.error('Fatal error: ecReplyForm not found! Add the ecReplyForm snippet to the page!');
                    }
                })
            });
            // Обработка клика по кнопке "Отмена" в форме ответа. Прячет форму ответа.
            document.querySelectorAll('.js-ec-reply-form-cancel').forEach(function (el) {
                el.addEventListener('click', function (event) {
                    event.preventDefault();
                    let replyForm = event.currentTarget.closest(easyComm.selectors.replyForm);
                    let thread = replyForm.querySelector('input[name="thread"]').value;
                    // Скроем форму и сбросим поля в ней
                    replyForm.classList.add(easyComm.classes.displayNone);
                    replyForm.querySelector('input[name="message_id"]').value = '';
                    replyForm.querySelector('input[name="parent_id"]').value = '';
                    // Покажем все ссылки "Ответить", которые относятся к текущей цепочке
                    document.querySelectorAll('.js-ec-reply[data-ec-thread="' + thread + '"]').forEach(function (el) {
                        el.classList.remove(easyComm.classes.displayNone);
                    });
                });
            });
        },
        send: function (form) {
            // отключим кнопку, чтобы избежать двойную отправку
            form.querySelector(easyComm.selectors.submit).setAttribute('disabled', 'disabled');
            // очистим ошибки
            form.querySelectorAll('.' + easyComm.classes.hasError).forEach(function (el) { el.classList.remove(easyComm.classes.hasError); });
            form.querySelectorAll('.ec-error').forEach(function (el) { el.innerHTML = ""; el.classList.add(easyComm.classes.displayNone); });

            // отправляем запрос
            let formData = new FormData(form);
            formData.append('action', 'reply/create');

            let xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.onreadystatechange = function () {
                if (xmlHttpRequest.readyState === XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
                    if (xmlHttpRequest.status === 200) {
                        let response = JSON.parse(xmlHttpRequest.responseText);
                        let fid = form.id;
                        form.querySelector(easyComm.selectors.submit).disabled = false;
                        if (response.success) {
                            // form.reset();
                            form.classList.add(easyComm.classes.displayNone);
                            if (typeof (response.data) == "string") {
                                form.insertAdjacentHTML('afterend', response.data);
                                easyComm.custom.refresh(form.parentNode);
                            } else {
                                easyComm.notice.show(response.message);
                            }
                        }
                        else {
                            if (response.data && response.data.length) {
                                for (let i = 0; i < response.data.length; i++) {
                                    let error = response.data[i];
                                    let inputGroup = form.querySelector('[name="' + error.field + '"]').closest(easyComm.selectors.inputParent);
                                    if (inputGroup) {
                                        inputGroup.classList.add(easyComm.classes.hasError);
                                    }
                                    let errorEl = form.querySelector('#' + fid + '-' + error.field + '-error');
                                    if (errorEl) {
                                        errorEl.innerHTML = error.message;
                                        errorEl.classList.remove(easyComm.classes.displayNone);
                                    }
                                }
                            } else {
                                easyComm.notice.error(response.message);
                            }
                        }
                    }
                    else {
                        easyComm.notice.error('Submit error');
                        form.querySelector(easyComm.selectors.submit).disabled = false;
                    }
                }
            };

            xmlHttpRequest.open("POST", easyCommConfig.actionUrl, true);
            xmlHttpRequest.send(formData);
        }
    },



    agree: {
        initialize: function () {
            // Checkbox with consent to the processing of personal data
            let ecForms = easyComm.selectors.form + ',' + easyComm.selectors.replyForm;
            document.querySelectorAll(ecForms).forEach(function (form) {
                form.querySelectorAll(easyComm.selectors.agree).forEach(function (agreeInput) {
                    let submit = agreeInput.closest('form').querySelector(easyComm.selectors.submit);
                    submit.disabled = true;

                    agreeInput.addEventListener('change', function () {
                        let submit = this.closest('form').querySelector(easyComm.selectors.submit);
                        submit.disabled = !this.checked;
                    });
                });
            });
        }
    },
    notice: {
        error: function (text) {
            alert(text);
        },
        show: function (text) {
            alert(text);
        }
    }
};

easyComm.custom = {

    /* =====================
       TIME AGO
    ===================== */
    timeAgo: function (dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);

        if (diffSeconds < 60) return 'только что';
        if (diffSeconds < 3600) return Math.floor(diffSeconds / 60) + ' мин. назад';
        if (diffSeconds < 86400) return Math.floor(diffSeconds / 3600) + ' ч. назад';
        if (diffSeconds < 172800) return 'вчера';

        return date.toLocaleDateString('ru-RU');
    },

    updateTimes: function (root = document) {
        root.querySelectorAll('[data-time]').forEach(el => {
            const time = el.getAttribute('data-time');
            if (!time) return;

            el.textContent = easyComm.custom.timeAgo(time);
            el.title = new Date(time).toLocaleString('ru-RU');
        });
    },

    /* =====================
       REPLY NESTING
    ===================== */
    applyReplyNesting: function (root = document) {
        const replies = Array.from(root.querySelectorAll('.ec-reply[data-reply-id]'));
        if (!replies.length) return;

        const byId = new Map();
        replies.forEach(el => byId.set(String(el.dataset.replyId), el));

        function getLevel(el) {
            let level = 1;
            let parentId = String(el.dataset.parentId || '0');
            const seen = new Set();

            while (parentId !== '0' && byId.has(parentId) && !seen.has(parentId)) {
                seen.add(parentId);
                level++;
                parentId = String(byId.get(parentId).dataset.parentId || '0');
                if (level > 8) break;
            }
            return level;
        }

        replies.forEach(el => {
            const level = getLevel(el);
            el.classList.add(`ec-reply--lvl${level}`);

            const parentId = String(el.dataset.parentId || '0');
            const toEl = el.querySelector('.js-ec-reply-to');

            if (toEl && parentId !== '0' && byId.has(parentId)) {
                const parent = byId.get(parentId);
                const parentAuthor = parent.dataset.author || '';
                if (parentAuthor) {
                    toEl.textContent = `Ответ для ${parentAuthor}`;
                }
            }
        });
    },

    refresh: function (root = document) {
        easyComm.custom.updateTimes(root);
        easyComm.custom.applyReplyNesting(root);
    }
};


document.addEventListener("DOMContentLoaded", function (event) {
    easyComm.initialize();
});
