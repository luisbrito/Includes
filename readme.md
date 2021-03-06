# ExtendScript Tools & Libraries
***Status:*** *Редактируемая версия...* | ***Version:*** *0.1* | ***Last update:*** *25.05.2014*

Несколько библиотек и утилит общего назначения, предназначенных для использования совместно с Adobe ExtendScript Toolkit.

Я занимаюсь ими в свободное время и в своё удовольствие, поэтому, даже не представляю, когда это всё можно будет считать полностью завершённым. Каждая из библиотек находится в разной стадии готовности и, уверен, до стадии архитектурной зрелости и частоты им ещё далеко. Тем не менее...

Все представленные библиотеки используют общий структурный дизайн, имеют модульную архитектуру, документацию (с которой у меня вечные проблемы из за недостаточного знания jsdoc, лени или нехватки времени) и уже по полной используются мной в различных проектах, включая довольно крупный - [Dialog Builder for ExtenScript & ESTK](https://github.com/SlavaBuck/DialogBuilder).

Возможно что-то из всего этого кому-то покажется интересным, буду рад... 

## Состав:

Общая структура папок описана в [readme_struct.md](readme_struct.md) приложении. Как уже отмечалось, все библиотеки используют общий модульный дизайн, идея которого описана в [readme_module.md](readme_module.md). На сегодня JSXLibs включает:

### Библиотеки общего назначения:

* [Collection](Collection/doc/readme.md) - реализация класса Collection для ES, упор сделан на работу с коллекциями объектов, широко применяется в [MVC](MVC/doc/tutorial_MVC.md);
* [MVC](MVC/doc/tutorial_MVC.md) - Фреймворк, реализующий паттерн MVC для JavaScript-приложений, разрабатываемых в среде **Adobe ExtendScript**, имеет расширяемую модульную архитектуру и пока только одно расширение [MVC.DOM](). На его основе я разрабатываю свой редактор диалогов [Dialog Builder]()
* [PNGLib](PNGLib/doc/readme.md) - небольшая экспериментальная библиотека для формирования в скрипте битовых образов PNG изображений в формате ScripUIImage.
* [QTest](QTest/doc/readme.md) - консольная библиотека для реализации модульного тестирования в ExtendScript с поддержкой аналогичного как у QUnit синтаксиса в модульных файлах тестов. Для неё есть GUI модуль [QTestManager](Tools/QtestManager.md), с поддержкой конфигурационных файлов и пакетной обработки файлов с модульными тестами;
* [SimpleUI](SimpleUI/doc/readme.md) - набор библиотек, ориентированных на работу с пользовательским UI и соответствующей подсистемой, включает несколько самостоятельных модулей;
	* [UIColors](SimpleUI/doc/readme_UIColors.md) - работа с цветом в различных форматах, также представлена таблица стандартных html/x11 цветов;
	* [UIControls](SimpleUI/doc/readme_UIControls.md) - набор расширенных пользовательских элементов управления (ProgressBar, ScrollablePanel, Separator, WebLink и др...);
	* [UIImage](SimpleUI/doc/readme_UIImage.md) - расширение базового класса ScripUIImage (добавлена поддержка масштабирования в пользовательских элементах управления) и функции для конвертации ScripUIImage в ресурсные строки и обратно;
	* [ESTKLib](SimpleUI/doc/readme_ESTKLib.md) - собрание и систематизация стандартных графических ресурсов ESTK;
* [_globals]() - это минимальный набор, значительно облегчающий мне жизнь и часто используемый во многих библиотека, там содержаться инструменты, включаемые в файлах *_debug.jsx* и *_util.jsx*, которые расположены в корне основной папки с библиотеками. 

> С библиотекой SimpleUI я пока ещё не определился - стоит ли делать общий фреймворк или нет... пока всё живёт отдельно. Библиотеки в большинстве своём полностью независимы, в комментариях к ним отмечается, если это не так.

### Утилиты и всякая мелочь:

В папке с библиотеками находится папка [Tools](Tools/readme.md) с утилитами, также написанными на javascript и используемые мной для облегчения собственной жизни в процессе программирования под ESTK :)

## Установка и использование:

В папке, где вы обычно размещаете свои скрипты, создайте новую папку для файлов библиотеки, например, в папке */Program Files (x86)/Adobe/Adobe InDesign CS6/Scripts/Scripts Panel/* создайте папку *Include*  и загрузите туда файлы библиотеки одним из следующих способов:

#### с помощью ***git clone***:
Если имеется установленный **git** - выполните в созданной папке в консоли команду:
```
git clone https://github.com/...
```
В результате у вас будет склонированы туда все папки, содержащие библиотеки и утилиты. 
#### из архива
Скачайте ***архив*** и просто распакуйте его в созданную для библиотек папку.

### Использование:
Для подключения библиотеки в вашем скрипте достаточно просто подключить её заголовочный файл:
```js
// подключение только основных инструментов
#include "<путь_к_файлу>/_util.jsx"

// подключение MVC.DOM (также подключит модули _util, Collection и MVC см. html-документацию)
#include "<путь_к_файлу>/MVC.DOM.jsx"
```
К каждой библиотеке имеется собственная документация, которую я стараюсь постепенно развивать, и, конечно, - примеры. Пользуйтесь... :)

----------------------------------
**Copyright:** © Вячеслав aka Buck, 2014. <slava.boyko@hotmail.com>

**License:** [Creative Commons Attribution-NonCommercial-ShareAlike 3.0](http://creativecommons.org/licenses/by-nc-sa/3.0/)

**РУС:** РАЗРЕШЕНО СВОБОДНОЕ ИСПОЛЬЗОВАНИЕ ПРОИЗВЕДЕНИЯ, ПРИ УСЛОВИИ УКАЗАНИЯ ЕГО АВТОРА, НО ТОЛЬКО В НЕКОММЕРЧЕСКИХ ЦЕЛЯХ. ТАКЖЕ ВСЕ ПРОИЗВОДНЫЕ ПРОИЗВЕДЕНИЯ, ДОЛЖНЫ РАСПРОСТРАНЯТЬСЯ ПОД ЛИЦЕНЗИЕЙ CC BY-NC-SA.

**ENG:** THE WORK (AS DEFINED BELOW) IS PROVIDED UNDER THE TERMS OF THIS CREATIVE COMMONS PUBLIC LICENSE (''CCPL'' OR ''LICENSE''). THE WORK IS PROTECTED BY COPYRIGHT AND/OR OTHER APPLICABLE LAW. ANY USE OF THE WORK OTHER THAN AS AUTHORIZED UNDER THIS LICENSE OR COPYRIGHT LAW IS PROHIBITED.