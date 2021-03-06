### Модульный шаблон заголовочного файла библиотеки/модуля
[Отредактированная](http://slavabuck.wordpress.com/2014/05/09/modulnyj-podxod-v-extendscript/) версия.

В целом, принятый шаблон представляет собой вариацию классического в JavaScript ["модульного"](http://habrahabr.ru/post/117069/) шаблона, с использованием глобального импорта внешних пространств имён и глобального экспорта пространства имён самого модуля, обёрнутого в анонимную функцию.
> **ExtendScript** в работе с необъявленными переменными имеет одну существенную особенность, не присущую другим JavaScript средам: когда в скрипте (в выражении, тоесть справа от любого операнда или в аргументе вызова любой функции) обнаруживается наличие необъявленной переменной — вместо ожидаемой подстановки значения *undefined* происходит вызов исключения с типом ReferenceError: *"MODULE is undefined"*, так что такой код в ExtendScript не будет работать:
```js
(function (my) {
    my.Method = function () {
      // added method...
    };
     return my;
}(MODULE||{}));
```
Единственный безопасный способ проверить объявлена переменная или нет - использовать её в выражении:
```js
(function (my) {
    my.Method = function () {
      // added method...
    };
     return my;
}(typeof MODULE == 'undefined' ? {} : MODULE) );
```

Взятая мной на вооружение идея была [позаимствована](https://forums.adobe.com/thread/1111415) у известного в мире Adobe разработчика Marca Autret-а. Подход Марка был расширен мной всего двумя деталями:

* Перед экспортом формируется 'фасад', который затем объединяется с пространством имён `MODULE` - объектом, представляющим сам модуль;
* Используется единственная точка `var MODULE = "ModuleName";` позволяющая задать будущее имя модуля/пространства имён. Далее, это текстовое значение конвертируется в объект-пространства имён и уже как объект-модуль `MODULE` импортируется в оборачивающую модуль анонимную функцию: 

```js
// @file Заголовочный файл модуля...
// --------------------------------------------------------------
// TODO: Включение глобальных зависимостей (внешних модулей):
// #include "Module.jsx"

// TODO: Это единственное место, где нужно прописать 
// Имя модуля:
/** @alias  */
var MODULE = "ModuleName";

$.global.hasOwnProperty(MODULE)||(function(GLOBAL, MODULE) {
    // Регистрация модуля
    GLOBAL[MODULE] = MODULE;
        
    // Модуль:
    MODULE["version"] = "0.0.1";
    MODULE["name"] = "My Libruary";

    // --------------------------------------------------------------
    // Реализация...
    // TODO:
    // Файлы с классами и прочим можно разместить в подчинённой папке
    // ./ModuleName/src/... затем включить их и оформить фасад модуля.
	#include "ModuleName/src/file.jsx"

    // --------------------------------------------------------------
    // Фасад модуля:
    // --------------------------------------------------------------
    var FACADE = {
        "ClassName":ClassName,
        "propName":propName,
        // ...
    };
    // Расширяем модуль фасадом:
    extend(MODULE, FACADE);

    // --------------------------------------------------------------
    // Экспорт в глобал всего фасада (если нужно)
    // --------------------------------------------------------------
    extend(GLOBAL, FACADE);
    // --- или ---
    // Вариант экспорта с модификацией имени префиксом - именем модуля :
    // each(keys(FACADE), function(m) {GLOBAL[MODULE + m] = FACADE[m];} );

    // --------------------------------------------------------------
    // Поддержка экспорта для модуля, включаемого с помощью eval():
    // --------------------------------------------------------------
    return MODULE;
    // --------------------------------------------------------------
})( $.global, { toString:function(){return MODULE;} } /*, импорт внешних модулей */ );
```
Использование данного паттерна предполагает реализацию всей функциональности модуля во внешних файлах, которые затем включаются внутрь анонимной функции с помощью директив #include, объединяются под общим фасадом FACADE, который, в свою очередь, может быть объединён как с объектом модуля, так и с глобальным пространством имён.

> Функции `extend()`, `each()` и `keys()` позаимствованы из underscore.js и входят в мою стандартную подборку глобальных инструментов. Без них данную
> операцию можно было бы организовать с помощью стандартных средств:
> ```js
> for (var m in FACADE) if (FACADE.hasOwnProperty(m)) {
> 	MODULE[m] = FACADE[m];
> }
> 
> // а вариант экспорта с модификацией имени лишь слегка изменён:
> for (var m in FACADE) if (FACADE.hasOwnProperty(m)) {
> 	GLOBAL[MODULE + m] = FACADE[m];
> }
> // При этом [MODULE + m] будет разворачиваться "ModuleName" + m => "ModuleNameClassName", и т.д. для всех FACADE ... 
> ```
> Можно было и вовсе обойтись конструкцией без всяких циклов и заменить `var FACADE = { ...` непосредственно на:
> ```js
> MODULE = {
>     "ClassName":ClassName,
>     "propName":propName,
>     // ...
> };
> ```
> Но мне хочется сохранить информацию о версии и имени модуля и экспортировать их в составе пространства имён самого модуля, для этого потребуется дополнительно включить в фасад строки `"version":"0.0.1",` и `"name":"My Libruary",` а уже при экспорте в глобал исключать эти свойства, вполне возможно вообще обойтись без этого - всё это остаётся на личное усмотрение.


#### Особенности реализации паттерна:
* Паттерн полностью самодостаточный и без дополнительного кода поддержки обеспечивает все основные модульные принципы для организации кода библиотеки или приложения;

> К таким основным модульным принципам можно отнести: 
> - безопасные персистентные механизмы (исключение повторной инициализации модуля в ситуациях неоднократного включения модуля в разных частях одного приложения или его библиотек, под безопасностью, в данном случае, имеется ввиду - безопасная проверка регистрации модуля в ExtendScript, не вызывающая исключений *'vuriable is undefined'*); 
> - возможности инъекций во внешние/внутренние пространства имён — позволяет расширение и пополнение модулей, реализацию модуля в нескольких файлах и т.п.
> - Отделение фасада модуля от его реализации — позволяет гибко управлять пространством имён модуля, его экспортом во внешнюю область видимости, в том числе в глобальную, или в область пространства имён другого модуля. 

* Все модули регистрируются в глобальном пространстве имён:

> Строка **`GLOBAL[MODULE] = MODULE;`** разворачивается в `$.global['ModuleName'] = MODULE` и, в конечном итоге, представляет эквивалент `$.global.ModuleName = {}`

* Паттерн обеспечивает персистентный механизм включения модулей (**persistent engines**) — время на конструирование тела модуля тратится только при первом его включении, при всех последующих включениях (не важно сколько раз и где это происходит) анонимная-функция модуля просто не выполняется, так как модуль уже обнаруживается;

> персистентность обеспечивается проверкой **`$.global.hasOwnProperty(MODULE)`** где `MODULE` развернётся в строку, заданную выше: `var MODULE = "ModuleName";`, таким образом анонимная функция, оборачивающая модуль, будет выполнена только один раз вне зависимости от того, сколько раз и где включается файл модуля, поскольку **`$.global.hasOwnProperty("ModuleName")`** вернёт ***false*** только один раз. Впоследствии, данная проверка всегда будет заканчиваться положительно и тело функции-модуля выполнятся уже не будет, а сам объект модуля останется доступным для кода в любой области видимости.
> ```js
> (function(){
>	#include(Module.jsx)
>   //...
>
> }());
> // ...
>
> #include(Module.jsx)
> //...
> ```
> В любых ситуациях тело функции-модуля выполняется только один раз (несмотря на то, что изначально модуль мог быть включён в изолированной области видимости).

* Паттерн достаточно универсальный, чтобы глобально изменить имя модуля - достаточно изменить единственную строчку `var MODULE = "ModuleName";`, при этом можно легко экспортировать в *глобал* не только пространство имён самого модуля, но и содержимое его фасада (это может быть полезно в случаях, когда в модуле определяются конструкторы, которые было бы удобно использовать глобально /как типы новых JavaScript объектов/):

> Например, определим модуль UI, который предоставляет нам новый тип объектов Point:
> ```js
> /**
>  * @file UI.jsx
> */
> 
> var MODULE = "UI";
> 
> $.global.hasOwnProperty(MODULE)||(function(GLOBAL, MODULE) {
>     // Регистрация модуля
>     GLOBAL[MODULE] = MODULE;
>         
>     // Модуль:
>     MODULE["version"] = "0.0.1";
>     MODULE["name"] = "UI Libruary";
>     
>     // Реализация 		
>     function Point(x, y) { 
>         this.x = (x)||0; 
>         this.y = (y)||0; 
>     }; 
>  
>     // Фасад и экспорт
>     return MODULE.Point = Point;
>
> })( $.global, { toString:function(){return MODULE;} } /*, импорт внешних модулей */ );
> ```
> Далее в скрипте мы можем использовать его:
> ```js
> #include "UI.jsx"
>
> var p = new UI.Point();
> $.writeln(p.toSource()); 			 // => ({x:0, y:0})
> $.writeln(p instanceof Point); 	 // => Ошибка!!!
> $.writeln(p instanceof UI.Point ); // => true
> ```
> Было бы гораздо удобнее использовать более короткие имена:
> ```js
> var p = new Point();
> $.writeln(p instanceof Point); 	 // => true
> $.writeln(p instanceof UI.Point ); // => true
> ```
> Для этого в теле модуля достаточно обеспечить экспорт Point в глобальное пространство имён, добавив строку `GLOBAL.Point = Point; // или return GLOBAL.Point = MODULE.Point = Point;`.

* Паттерн можно легко использовать не только для экспорта в *глобал* но и для обеспечения персистентности вложенных пространств имен и суб-модулей. Для этого достаточно в файле подчинённого модуля заменить проверку *`$.global.hasOwnProperty(MODULE)`* на *`SUPERMODULE.hasOwnProperty(MODULE)`* а в аргументах анонимной функции-модуля - добавить ссылку на нужный родительский модуль - SUPERMODULE (последнее не обязательно, но может быть полезным для ускорения доступа к нему внутри области видимости самовызываемой функции-модуля):

> Например, так можно оформить дополнительный модуль Controls, и разместить его в пространстве имён модуля UI из предыдущего примера:
> ```js
> /**
>  * @file UI.Controls.jsx
> */
> // Включаем родительский модуль
> #include "UI.jsx"
>
> // Оформляем подмодуль (подчинённое пространство имён):
> /** @alias UI.Controls */
> var MODULE = "Controls";
> 
> // $.global - заменяем на родительский модуль UI и 
> // его же импортируем внутрь функции-модуля:
>
> UI.hasOwnProperty(MODULE)||(function(GLOBAL, MODULE, UI) {
>    // Регистрация модуля
>    // GLOBAL[MODULE] = MODULE; - нам ненужно регистрировать
>    // подчинённый Controls в глобале, вместо этого нам нужно
>    // зарегистрировать его в пространстве имён родительского
>    // модуля UI:
>    UI[MODULE] = MODULE; // вызов будет развёрнут в UI.Controls = {};
>        
>    // дальше всё без изменений...
>    // Модуль:
>    MODULE["version"] = "0.0.1";
>    MODULE["name"] = "UI.Controls Extension";
>    
>    // Реализация
>	 // тут реализована функция UIText
>    #include "UIText.jsx"
>	 // тут реализована функция UIImage
>    #include "UIImage.jsx"
>    // ...
>
>    // --------------------------------------------------------------
>    // Фасад модуля:
>    // --------------------------------------------------------------
>    // Для фасада используем короткие имена (без префикса UI):
>    var _members = {
>        "Text":UIText,
>        "Image":UIImage,
>        // ...
>    };
>    // Расширяем модуль фасадом (MODULE["Text"] = Text;... и т.д.):
>    extend(MODULE, _members);
>
>    // --------------------------------------------------------------
>    // Экспорт в глобал
>    // --------------------------------------------------------------
>    // extend(GLOBAL, _members); - такое нам сейчас не подходит...
>    //
>    // Чтобы, например, не экспортировать в глобал короткое Image во
>    // избежание конфликта и перекрытия "чужого" типа Image, уже 
>    // имеющегося в глобале - при экспорте в глобал вернём именам
>    // конструкторов префикс UI:
>	 each(keys(_members), function(m) {GLOBAL["UI"+m] = _members[m];} );
>    // Это эквивалентно $.global.UIImage = UIImage, ... и т.д. для всех _members
> 
>    // Также можно подкорректировать экспорт функции или оставить
>    // MODULE - не особо критично, но, как правило, лучше всегда
>	 // возвращать "родительское" пространство имён: 
>    return UI;
>
> })( $.global, { toString:function(){return MODULE;} }, UI );
> ```
> Такая организация модуля позволит в пользовательском скрипте: 
> - во первых: ограничится включением только *UI.Controls.jsx*, который автоматом подтянет *UI.jsx*
> - во вторых: иметь возможность доступа к конструкторам как по полному имени `var t = new UI.Controls.Image();` так и по короткому `var t = new UIImage();`
> - в третих: нет конфликта с типом Image, который, в рамках ScriptUI, экспортируется в глобал как Image и, при этом, используется конструктором объектов ScriptUIImage в методе ScriptUI.newImage(...);

* Файлы исходников, подключаемые внутри модуля, совершенно ничего не обязаны знать о самих модулях и могут писаться так, как будто они пишуться внутри самой анонимной 'модульной' функции или в глобальном контексте. В том числе, любые локальные объявления так и останутся локальными и не 'выплывут' во внешнюю или  глобальную область видимости если их специально не включить в экспортируемый фасад модуля.

#### Особенности использования паттерна:

* Паттерн одинаково хорошо работает: и в сценариях включения модуля с помощью #include, и в случае включения модуля с помощью eval() или $.evalFile() (например, `var Module = $.evalFile(Module.jsx);`); а также в скомпилированном виде jsxbin;

> Есть возможность использовать собственный менеджер модулей в виде метода requre('Имя модуля'); или include('Имя файла'); и использовать их в подобных сценариях: `var myModule = requre('Module');` При этом сама функция requre() может быть гипотетически реализована следующим образом:
```js
> function require(name /* string */) {
> 	var module = this[name]; // типа кеширование
> 	// некая функция, которая находит файл модуля по его короткому имени
> 	var file_path = (resolvePathForModule(name))||(throw Error("Файл модуля не найден.")); 
> 	try { module = $.evalFile(file_path); } catche(e) {
> 		throw Error("Внутренняя ошибка инициализации модуля.")
> 	};
> 	return module;
> };
> ```
> В результате: переменной `module` будет присвоен объект, возвращаемый функцией-модулем. Этот объект возвращается из области видимости require(). Специально для таких сценариев в принятом паттерне Модуля используется оператор **`return MODULE;`** без этого вызов `requre('Module');` обеспечивал бы только регистрацию модуля в глобале (при условии что его файл найден и отработан без ошибок), а возвращаемое им значение соответствовало бы значению undefined, что затруднило бы использование таких модулей с гипотетическими загрузчиками и/или внешними менеджерами пакетов.
> 
> В приложении можно как угодно комбинировать require(); include(); или #include "..." - паттерн будет работать одинаково для любого сценария включения!

* Паттерн легко переделать в любой другой формат модуля, например в CommonJS, для чего достаточно после строки регистрации модуля `GLOBAL[MODULE] = MODULE;` добавить `exports[MODULE] = MODULE;`, а для среды, отличной от ExtendScript, достаточно минимальных изменений только в заголовке модуля и в аргументах импорта самой анонимной функции;
* Разделение анонимной функции-модуля и кода реализации между разными файлами обеспечивает более адекватные возможности отладки в debager-е ExtendScript, так как навигация по ошибкам, возникающим внутри анонимных пространств имён, в ExtendScript почти всегда работает криво (не всегда определяется переход на строку, в которой возникло исключение и т.п.).

**Copyright:** © Вячеслав aka Buck, 2014. <slava.boyko@hotmail.com>
