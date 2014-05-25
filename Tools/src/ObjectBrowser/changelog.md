﻿#### CHANGE LOG: ####

ver 1.13
  - небольшой рефакторинг для перезда под новую редакцию библиотеки

ver 1.12
  - подкорректирована обработка ошибок чтения свойств (проблема осталась только с чтением static методов, наследуемых от базовых классов)
  - слегка изменён порядок обработки типов Enumeration - теперь в дереве свойств и в правом окне с информацией выводится их строковое представление
     (как пишется в теле скрипта), а в заголовке - фактическое численное или строковое значение (было наоборот)
  - значительно переработан и оптимизирован для быстрого вывода _buildTree(), для уменьшения мерцания при обновлении дерева, для этого контейнер, 
     содержащий центральные части окна, был сделан белым (визуально это практически не заметно зато в циклах окно обновляется в разы лучше и быстрее). 
  - доработана часть библиотеки, отвечающая за сепараторы: исправлен поиск левых и правых соседей, доработана основная функция onMouseMove
  - подчищен код, во все ключевые места добавлены комментарии

ver 1.11
  - доработана обработка ошибок чтения свойств, имеющих значение undefined и добавлена соответствующая раскраска в иконке такого свойства
  - добавлена обработка свойств с типом 'Collection'
  - добавлено отображение статических методов объекта
  - улучшена информативность вывода и _buildEdit(),
  - значительно улучшена производительность _buildTree() - усечён вывод содержимого длинных строк в дерево свойств

ver 1.10
  - решена проблема с ошибкой чтения некоторых свойств объекта в процедурах _buildTree() и _buildEdit(), что приводило к невозможности просмотра этих
    объектов (например глобального объекта app в окружений #target "InDesign-8.0"; #targetengine 'session', и т.п.)
  - изменена обработка ошибок чтения свойств в _buildEdit() теперь они наглядно отображаются в правом окне вместе с именем соответствующего свойства
  - исправлена недоработка в сортировке свойств объекта в окне TreeView
  - модифицированы процедуры обработки событий мыши для сепаратора - теперь обработчики регистрируются напрямую в главном окне ObjectBrowser, а не
    в родительском контейнере (слегка улучшилась реакция интерфейса, но проблема потери управляемости полностью не устранена)
  - слегка подчищен код, устранено несколько мелких недоработок, создан change log. 

ver 1.1
  - первая публичный выход в свет, поддержка различных окружений #targetengine, 
  - полностью динамический пользовательский интерфейс
  - поддержка ReflectionInfo для методов и свойств JS объектов
  - возможность запуска в режимах dialog/palette (обеспечило удобное использование в качестве деббагера в циклах)

ver 1.0 
  - первая реализация была ближе к плавающей JavaScript консоли, чем к настоящему Data Browser, не имела поддержки интерфейса ReflectionInfo, работала 
    только в окружении ExtendScript Toolkit (работала в других окружениях была возможна, но была сопряжена с рядом проблем...)
  - полностью статический пользовательский интерфейс

-----------------------------------------------
**Copyright:** © Вячеслав aka SlavaBuck, 26.10.2013. <slava.boyko@hotmail.com>