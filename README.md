# Задача со стажировки JetBrains "Grazie Web Editor"

## Описание

Реализуйте Markdown редактор с подсветкой синтаксиса.

Редактор должен поддерживать:

* Проверку орфографии для английского языка

* Подсветку синтаксиса языка Markdown

Будет плюсом, если редактор будет поддерживать:

* Проверку орфографии дополнительных языков
 
* Автодополнение фраз (по предзаданным парам "начальное слово -> вся фраза")

* Превью готового документа

Редактор НЕ должен быть WYSIWYG - обычные plain Markdown с подсветкой.
При реализации разрешается использовать готовые библиотеки, в частности рекомендуется обратить внимание на CodeMirror.

В качестве ответа нужно сдать ссылку на публичный Git репозиторий с выполненным заданием.

В репозитории должен быть ясно описан способ сборки проекта и иметься готовый HTML файл с интегрированным в него редактором (или описание как поднять сервер с UI).

## Запуск
1. Клонируем репозиторий
2. Выполняем команду `npm run server`
3. Переходим в браузере по URL **localhost:8080**

## TODO
1. ~~Разбить одну большую загрузку словаря на несколько асинхронных задач (т.е снизить лаг в начале запуска)~~
2. Добавить поддержку автодополнения фраз
3. ~~Добавить предложения по исправлению ошибок в орфографии~~ Реализовать диалоговое окно для отображения предложений

## Реализовано
1. Подсветка синтаксиса Markdown
2. Поддержка двух языков: русского и английского (проверка орфографии)
3. Превью документа
4. Предложения по исправлению ошибок в орфографии
5. Создание экземпляров классов библиотеки проверки орфографии в отдельном воркере

