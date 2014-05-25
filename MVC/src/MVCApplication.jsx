﻿// --------------------------------------------------------------
// @@@BUILDINFO@@@
// MVCApplication
// --------------------------------------------------------------

// Локализация:
#include "locales.jsxinc"

/**
 * @extends MVCObject#
 * @class   MVCApplication
 * @summary Объект <b>MVC-Приложение</b>.
 * @desc    Поддерживает коллекции MVC-объектов, предоставляет интерфейс для управления ими (создание, удаление, поиск и получение их из 
 *  коллекций) и отвечает за формирование главного окна - основного родительского диалога. Кроме того, может в целом выступать в качестве 
 *  изолированного пространства имён для всего пользовательского приложения.
 *      
 * @param {object} [prefs]                          Параметры инициализации (опционально)
 * @param {string} [prefs.name = "Приложение MVC"]  имя объекта-приложения, присваивается свойству .name;
 * @param {string} [prefs.version = ""]             версия, присваивается свойству .version;
 * @param {string} [prefs.caption = name + version] заголовок окна, по умолчанию формируется автоматически из имени и
 *                                                  и версии, присваивается свойству .caption; 
 * @param {string} [prefs.view = "dialog"]          ScriptUI-строка, используемая в качестве аргумента при вызове
 *                                                  new Window(prefs.view) для формирования главного окна приложения,
 *                                                  присваивается свойству .view;
 * @property {string}       id          id объекта-приложения ();
 * @property {string}       name        имя объекта-приложения;
 * @property {string}       version     версия объекта-приложения;
 * @property {string}       caption     заголовок главного окна;
 * @property {string}       view        ресурсная ScriptUI-строка, представляющая главное окно;
 * @property {UIControl}    window      ScriptUI-объект, представляющий главное окно приложения;
 * @property {MVCView}      mainView    представление, в рамках которого инкапсулировано главное окно приложения;
 * @property {Collection}   models      коллекция моделей;
 * @property {Collection}   views       коллекция представлений;
 * @property {Collection}   controllers коллекция контролёров;
 * @property {number}       exitcode    код завершения приложения (устанавливается как результат вызова window.show() в методе run()
 * @property {object}       _counters_  hash-объект, используется как счётчик объектов в коллекциях для генерации уникальных id;
 *
 * @fires MVCApplication#onExit
 * 
 * @returns {MVCApplication} Каждый новый вызов конструктора переустанавливает свойство MVC.app на созданный экземпляр Приложения.
 *
 * @example <caption>Пример создания и запуска MVC-Приложения</caption>
 * // Этого достаточно, чтобы создать MVC-приложение:
 * var myApp = new MVC.Application();
 * myApp.run();
 * 
 * @example <caption>Создание объекта Приложения с заданными параметрами главного окна</caption>
 * // В результате Приложение получит масштабируемое окно (тип окна
 * // задан как palette с установленным свойством resizeable:true) 
 * var myApp = new MVC.Application({
 *      name:"Приложение MVC",
 *      version:"1.00",
 *      caption:"Приложение MVC (MVC v"+MVC.version+")",
 *      view:"palette { preferredSize:[350,200], properties:{resizeable:true} }"
 *  });
 */
function MVCApplication(prefs) {
    MVC.app = this;  
    var prefs = (prefs !== undefined ? merge(prefs) : {});
    MVCApplication.prototype.__super__.constructor.call(this, prefs);
    this.name = (this.name)||localize(locales.DEF_APPNAME);
    this.version = (this.version)||"1.00";
    this.caption = (this.caption)||(this.name+" v" + this.version + " (MVC v"+MVC.version+")");
    this.view = (this.view)||"dialog";
    this._counters_ = { models:0, views:0, ctrls:0 }; // Hash для id добавляемых MVC-объектов (учавствует в формировании id-шников по умолчанию для соответствующих объектов)
    this.models = new Collection();         // Коллекция моделй
    this.views = new Collection();          // Коллекция представлений
    this.controllers = new Collection();    // Коллекция контролёров
    this.exitcode = undefined;              // Код завершения приложения (устанавливается в методе run())
    // Конструирование главного окна:
    this.CreateMainView(this.view); // Инициализирует this.window и this.mainView
};

inherit(MVCApplication, MVCObject);

/**
 * @method  MVCApplication#run
 * @summary Стартует приложение.
 * @desc    Старт выполняется в два этапа: - вначале выполняется собственный метод Init(); затем выполняет отображение главного 
 *  окна Приложения, путём вызова <code>MVCApplication.window.show()</code>.
 *  
 * @returns {number} Возвращает код завершение, полученный от метода show() главного диалогового окна приложения.
 */
MVCApplication.prototype.run = function() {
    this.Init();
    var code = this.window.show();
    if (this.exitcode === undefined) this.exitcode = code;
    return this.exitcode;
};

/**
 * @event   MVCApplication#onExit
 * @summary Обработчик завершения Приложения.
 * @desc    Назначается как обработчик для события onClose главного окна приложения .window и, таким образом, вызывается 
 *     автоматически после его закрытия. Метод выступает в роли обработчика закрытия приложения и предназначен для 
 *     переопределения в реальном экземпляре объекта-приложения.
 * 
 * @param {UIEvent} e Обработчик получает событие, переадрисованное от обработчика onClose() главного окна Приложения.
 * @returns {any}
 */
MVCApplication.prototype.onExit = function(e) {
    return true; 
};

/**
 * @method  MVCApplication#Init
 * @summary Инициализация <b>Приложения</b>.
 * @desc    Метод вызывается автоматически в процессе звпуска <b>MVC-Приложения</b>: {@linkcode MVCApplication#run MVCApplication.run()}. 
 *  Вызов происходит в контексте объекта-приложения, не получает параметров и предназначен для переопределения 
 *  с целью выполнения всех необходимых действий по инициализации данных приложения. {@linkcode MVCApplication#CreateMainView Пример}.
 * @abstract 
 * 
 * @returns {any} определяется пользователем.
 */
MVCApplication.prototype.Init = function() {
    return true;
}

// Простая фабрика 
//~     MVC.Application.Create = function(prefs) {
//~         var prefs = (prefs)||{};
//~         var app = new MVC.Application(prefs);
//~         return app;
//~     };

/**
 * @method  MVCApplication#CreateMainView
 * @summary <i>Приватный</i> метод, формирующий главное окно приложения. 
 * @desc    Метод формирует главное окно приложения из ресурсной ScriptUI-строки, переданной в качестве аргумента вызова.
 *  При формировании окна обеспечивается корректная обработка свойства <code>properties:true</code>, если оно заявлено в
 *  ресурсной строке и навешивается обработчик на событие '<code>close</code>' окна, который обеспечивает вызов обработчика
 *  Приложения {@link MVCApplication#event:onExit .onExit()}, который может быть определён для выполнения каких либо операций
 *  при закрытии главного окна приложения. В результате работы, метод инициализирует свойства <code>.window</code> и <code>.mainView</code> 
 *  объекта-приложения.
 *  <p>Конструктор <code>MVCApplication()</code> вызывает этот метод при создании экземпляра Приложения. Подходящее место
 *  для явного вызова этого метода - тело функции Init(), предусмотренной для переопределения в "рабочем" экземпляре 
 *  объекта-приложения.</p>
 *  
 * @param {string} rcString ресурсная ScriptUI-строка для формирования диалога, представляющего главное окно приложенияю
 * @returns {MVCView} Главное окно Приложения.
 * @example <caption>CreateMainView() позволяет получить полный контроль над процессом создания главного окна приложения</caption>
 * var myApp = new MVC.Application();
 * myApp.Init = function() {
 *     // ресурсная строка любой длинны и сложности
 *     var rc = "dialog { preferredSize:[350,200], properties:{resizeable:true} }"
 *     this.CreateMainView(rc);
 *     // В результате вызова CreateMainView() свойству this.window присвоена ссылка
 *     // на созданное окно, теперь с ним можно работать напрямую
 *     this.window.text = "la-la-la...";
 *     //... 
 *
 *     // делать здесь вызов this.window.show() не нужно, - этот вызов будет
 *     // произведён внутри метода .run()
 * };
 * 
 * myApp.run(); // Выполнит .Init() и откроет окно (выполнит .window.show();)
 */
MVCApplication.prototype.CreateMainView = function(rcString) {
    var app = this,
           rcStr = (rcString)||"dialog";
     // главное представление всегда имеет id == 'window'
    app.mainView = new MVCView('window', new Window(rcStr), rcStr);
    var w = app.window = app.mainView.control;
    w.text = app.caption;
    // только для resizeable окон
    if (w.properties && w.properties.resizeable) { w.onResizing = w.onResize = function() { w.layout.resize() } }; 
    // обеспечиваем работу обработчика приложения onExit():
    w.addEventListener('close', function(e) {  return app.onExit(e); });
    // главное Представление всегда 1-е в коллекции: 
    return app.views[0] = app.mainView;
};

/**
 * @method  MVCApplication#addModel
 * @summary Добавление <b>Модели</b>:
 * @desc    Создаёт и добавляет объект-модель в коллекцию models приложения. 
 *  В качестве аргумента метод принимает литерал классического JavaScript-объекта, который выступает 
 *  в качестве основы объекта данных приложения - модели. В литерале предусматривается несколько 
 *  специально-зарезервированных полей, определяющих особенные характеристики модели. 
 * 
 * @param {object}   [obj]      литерал, представляющий пользовательские данные - основу объекта MVCModel
 * @param {string}   [obj.id]   id (идентификатор) объекта, должен быть уникальным в пределах коллекции;
 * @param {function} [obj.validator] метод, выполняющий валидацию модели (см MVCModel.validator());
 * 
 * @returns {MVCCModel}
 * @example <caption>Стандартный способ создания Моделей:</caption>
 *  // myApp – созданный ранее объект MVCApplication
 *  var myData = myApp.addModel({
 *      id:"myData", 
 *      value:{ txt:"Мои данные" },
 *      print:function() { $.writeln(this.value.txt) },
 *      // метод-валидатор - предусмотрен библиотекой, 
 *      // может определяется в конкретном экземпляре 
 *      // Модели при необходимости (см. MVCModel.validator();)
 *      validator:function(key, oldVal, newVal, ctrl) {
 *          return (newVal.length < 10 || newVal.length > 30) ? false : true;
 *      }
 *  });
 *  myData.print(); // => `Мои данные`
 *  $.writeln(myData instanceof MVCModel); // => true
 *  $.writeln(typeof myData); // => object
 *  $.writeln(myData.id == "myData"); // => true
 *  $.writeln(myData.value.txt == "Мои данные"); // true
 */
MVCApplication.prototype.addModel = function(obj) {
    obj.id = (obj.id)||('model' + (this._counters_['models']++));
    var models = this.models;
    if (models.getFirstIndexByKeyValue('id', obj.id) != -1 ) throw Error(localize(locales.ERR_BOBJKEY, obj.id, "models" ));  
    var obj = extend(new MVCModel(), obj);
    models.add(obj);
    return models[models.length-1];
};

/**
 * @method  MVCApplication#removeModel
 * @summary Удаление <b>Модели</b>.
 * @desc    Удалении модели из коллекции моделей приложения приводит, в том числе, и к удалению всех контролёров, связанных с данной моделью.
 * 
 * @param  {string|MVCModel} model id модели или сам объект MVCModel
 * @returns {number} Возвращает кол-во моделей в коллекции после удаления. Если удаление не состоялось - возвращает -1
 * @example <caption>Удаление модели, созданной в предыдущих примерах:</caption>
 * myApp.removeModel("myModel");
 */
MVCApplication.prototype.removeModel = function(obj) { //  В качестве obj принимает либо id-модели, либо сам объект-модель
    if (!obj) return -1;
    var app = this,
           model = (typeof obj == 'string') ? app.models.getFirstByKeyValue('id', obj) : app.models.getFirstByValue(obj);
    if (model) { 
        for (var i=0, ctrls=model._controllers, max=ctrls.length; i<max; i++) { app.removeController(ctrls[i]); }
        app.models.removeByValue(model);
        return app.models.length;
    }
    return -1; //throw Error ('Model not found');
};

/**
 * @method  MVCApplication#addView
 * @summary Добавление нового <b>Представления</b>.
 * @desc    Метод создаёт и добавляет объект-представление в коллекцию <code>views</code> Приложения. 
 * В качестве аргумента метод принимает литерал классического JavaScript-объекта, который описывает параметры создаваемого
 * Представления. В литерале предусматривается несколько специально-зарезервированных полей, определяющих особенные характеристики
 * создаваемого объекта-представления. 
 * 
 * @param {object}   [obj]      литерал, описывающий создаваемый объект-представление.
 * @param {string}   [obj.id]      id (идентификатор) объекта, должен быть уникальным в пределах коллекции;
 * @param {object}   [obj.parent = window]   родительский контейнер для элемента управления, по умолчанию 
 *                                 родительским конт. является главное окно приложения (опционально);
 * @param {string}   obj.view      ресурсная строка для создания ел.управления, используется как аргумент ScriptUI метода 
 *                                 Window.add(...) (указывается обязательно);
 * @param {object}   [obj.control] литерал объекта, все свойства в рамках которого будут объеденены непосредственно со
 *                                 ScriptUI-объектом - элементом управления, полученным на основе свойства .view
 *                                 В рамках этого литерала удобно переопределять стандартные обработчики (например, onChange и
 *                                 onChanging);
 * @param {function} [obj.Init]    функция-инициализатор для эл.управления. Вызывается в контексте MVCView.control сразу после
 *                                 его создания;
 * @param {function} [obj.render]  обработчик, вызываемый когда требуется обновить представление в связи с обновлением модели.
 *
 * @returns {MVCCView}
 * @example <caption>Полная сигнатура метода .addView()</caption>
 * // myApp – созданный ранее объект MVCApplication
 * var myView = myApp.addView({ 
 *     id:"myView",     // id объекта 
 *     // родительский контейнер для ел.уп.
 *     parent:myApp.window.panel, 
 *     // ресурсная строка для создания ел.управления
 *     view:"EditText { characters:15 }",   
 *     control:{   // все свойства, заданные в рамках объекта control
 *                 // объединяются с создаваемым эл.управления
 *                 // Например, перезапишется обработчик onChange:
 *         onChange:function() { },
 *                 // и добавится новое свойство “property”:
 *         property:{ }
 *     },
 *     Init:{function},   // функция-инициализатор для эл.управления
 *     render:{function}  // обработчик, вызываемый когда требуется обновить
 *                        // представление в связи с обновлением модели.
 * });
 */
MVCApplication.prototype.addView = function(obj) {
    obj.id = (obj.id)||('view' + (this._counters_['views']++));
    obj = extend(new MVCView(), obj);
    var views = this.views;
    var w = (obj.parent)||this.window;
    if (views.getFirstIndexByKeyValue('id', obj.id) != -1 ) throw Error(localize(locales.ERR_BOBJKEY, obj.id, "views" )); 
    // Всё что определено в свойстве модели obj.control будет связано непосредственно с созданным ScriptUI элементом (функции будут привязаны к его контексту)
    obj.control = extend( w.add(obj.view), (obj.control)||{});
    // Пост-инициализация - вызов Init в контексте созданного ScriptUI элемента (по умолчанию данный метод ничего не делает)
    obj.Init.call(obj.control);
    views.add(obj);
    return views[views.length-1];
};

/**
* @method   MVCApplication#removeView
* @summary  Удаление <b>Представления</b>. 
* @desc     При удалении никакие связанные объекты моделей и контролёров не затрагиваются.
*
* @fires MVCView#event:onRemove
* 
* @param  {string|MVCView}  obj      id представления или само представление - объект MVCView
* @returns {number}     Возвращает кол-во объектов в коллекции после удаления. Если удаление не состоялось - возвращает -1
 * @example <caption>Yдаление представления, созданной в предыдущих примерах:</caption>
 * myApp.removeView("myView");
 */
MVCApplication.prototype.removeView = function(obj) { //  В качестве obj принимает либо id-представления, либо сам объект-представление
    if (!obj) return -1;
    var app = this;
    var view = (typeof obj == 'string') ? app.views.getFirstByKeyValue('id', obj) : app.views.getFirstByValue(obj);
    if (view) { 
        view.remove(); // для ScriptUI требуется специальная обработка (см MVCView.prototype.remove(...) )
        app.views.removeByValue(view);
        return app.views.length;
    }
    return -1; // throw Error ('View not found');
};

/**
 * @method MVCApplication#addController
 * @summary Добавление нового <b>Контролёра</b>.
 * @desc    Метод создаёт и добавляет в коллекцию <code>controllers</code> объект MVCController (контролёр). В качестве аргумента вызова
 *  принимает комплексный параметр {@link cparams param}, который передаётся конструктору {@link MVCController MVCController(param)},
 *  который выполняет связывание Модели и Представления.
 *  <p><i><b>ПРИМЕЧАНИЕ:</b> Задавать значения параметров id и app необязательно, метод обеспечивает автоматическую инициализацию свойства
 *           свойства param.app ссылкой на собственный объект MVCApplication и, в случае отсутствия значения param.id - обеспечивает
 *           автоматическую генерацию уникального id для Контролёра.</i></p> 
 * 
 * @param {cparams} param          литерал объекта, представляющий параметры инициализации контролёра;
 * @param {string} [param.app]    автоматически инициализируется ссылкой на MVCApplication, в контексте которого происходит вызов этого метода;  
 * @param {string} [param.id]     id для создаваемого контролёра, должен быть уникальным в рамках коллекции controllers, если не указан - 
 *                                генерируется автоматически;
 * @param {string} [param.binding] строка биндинга (см. {@link MVCApplication MVCController});
 * @param {boolean}[param.bind = true] флаг, связывания (см. {@link MVCApplication MVCController}).
 *                            
 * @returns {MVCController}
 * @example <caption>Пример создания Контролёра</caption>
 * // Значение myModel.value.text будет сразу присвоено myView.text:
 * myApp.addController({ binding:"myModel.value.text:myView.text" });
 * // ...
 * // Значение myModel.value.text не будет сразу присвоено myView.text:
 * myApp.addController({ binding:"myModel.value.text:myView.text", bind:false });
 */
MVCApplication.prototype.addController = function(param) {
    var controllers = this.controllers,
        obj = merge(param);
    obj.id = (obj.id)||('ctrls' + (this._counters_['ctrls']++));
    // Проверка на уникальность id:
    if (controllers.getFirstIndexByKeyValue('id', obj.id) != -1) throw Error(localize(locales.ERR_BOBJKEY, obj.id, "controllers" )); 
    // Добровольно принудительно переустанавливаем ссылку Контролёра на данное Приложение:
    obj.app = this;
    // Сразу пополняем коллекцию контролёров приложения
    controllers.add(new MVCController(obj));
    // Возвращаемый добавленный контролер:
    return controllers[controllers.length-1];
};

/**
* @method   MVCApplication#removeController
* @summary  Удаляет <b>Контроллер</b>. 
* @desc     При удалении, связанные Представлениt и Модель "отсвязюваются" друг от друга (но остаются в своих коллекциях), сам
* объект-контролёр удаляется из коллекции <code>controllers</code>.
* 
* @param  {string|MVCController} ctrl id контролёра или сам контролёр - объект MVCControler
* @returns {number} Возвращает кол-во объектов в коллекции после удаления. Если удаление не состоялось - возвращает -1
*/
MVCApplication.prototype.removeController = function(obj) { // в качестве obj принимает либо id-контролёра, либо сам объект-контролёр
    if (!obj) return -1;
    var app = this;
    var ctrl = (typeof obj == 'string') ? app.controllers.getFirstByKeyValue('id', obj) : app.controllers.getFirstByValue(obj);
    if (ctrl) {
        // убиваем "слушателя" - выполняем unwatch
        ctrl.disable(); 
        // удаляемся из персональной коллекции контролёров модели:
        if (ctrl.model && ctrl.model._controllers) ctrl.model._controllers.removeByValue(ctrl);
        app.controllers.removeByValue(ctrl); 
        return app.controllers.length;
    }
    return -1; 
};

 /**
 * @method  MVCApplication#removeMVC
 * @summary Универсальный метод удаления <b>MVC-объектов</b>.
 * @desc    Принимает либо строковое значение, либо MVC-объект (<b>Контролёр</b>, <b>Модель</b> или <b>Представление</b>). 
 *     Любое строковое значение рассматривается как возможное значение <tt>id</tt>-MVC-объекта и происходит попытка найти 
 *     данный объект в коллекциях:
 *     <p>в начале происходит поиск в коллекции <code>controllers</code>, затем в <code>models</code> и затем в <code>views</code>.
 *     Далее происходит процедура удаления по следующему принципу: </p><div>
 *     - При удалении Контролёра - удаляются связанные с ним объекты Модель и Представление.
 *     - При удалении Модели - удаляются связанные с ней объекты-Представления и Контролёры.
 *     - При удалении Представления - удаляется только указанный объект-Представление. </div>
 *     <p>Метод удобно применять для совместного удаления связки <b>Модель</b> + <b>Представление</b> + <b>Контролёр</b>, передавая 
 *     в качестве аргумента указатель на объект-<b>контролёр</b>.</p>
 *
 * @fires MVCView#event:onRemove
 * 
 * @param  {string|MVCController|MVCModel|MVCView} obj удаляемый MVC-объект (или id объекта, тогда происходит автоматическая 
 *                                                     попытка его поиска и удаления из соответствующей коллекции.)
 * @returns {boolean} <b>true</b> если удаление прошло успешно, иначе <b>false</b>.
 * @example <caption>Удаление MVC-объектов, созданных в предыдущих примерах:</caption>
 * // удаление только представления:
 * myApp.removeMVC(myApp.getViewByID("myView"));
 * // удаление модели также приводит и к удалению
 * // контролёра, все вызовы равнозначны: 
 * myApp.removeMVC("myModel"); // будет произведён
 *                             // поиск и удаление
 *                             // объекта со значением
 *                             // id == 'myModel'
 * // прямое удаление модели:
 * myApp.removeMVC(myApp.getModelByID("myModel"));
 * // удаление с указанием контролёра - удалит
 * // все три MVC-объекта:
 * myApp.removeMVC(myApp.findController(myModel));
 * // или:
 * myApp.removeMVC(myApp.findController(myView));
 */
MVCApplication.prototype.removeMVC = function(obj) {
    var app = this, model = obj;
    if (!model) return false;
    if (typeof obj == 'string') {
        model = app.models.getFirstByKeyValue('id', obj);
        if (!model) {
            model = app.controllers.getFirstByKeyValue('id', obj);
            if (!model) {
                model = app.views.getFirstByKeyValue('id', obj);
                if (!model) return false;
            }
        }
    } 
    switch (classof(model)) {
        case 'MVCModel':
            for (var i=0, ctrls=model._controllers, max=ctrls.length; i<max; i++) { 
                if (ctrls[i]) { app.removeView(ctrls[i].view); app.removeController(ctrls[i]); } 
            }
            app.models.removeByValue(model);
            break;
        case 'MVCController':
            app.removeView(model.view);
            app.removeController(model);
            break;
        case 'MVCView':
            app.removeView(model);
            break;
        default: return false;
    }
    return true;
};

/**
 * @method  MVCApplication#findController
 * @summary Поиск связанного с объектом Контролёра.
 * @desc    Происходит попытка обнаружения контролёра, связанного с аргументом. В качестве аргумента могут выступать либо MVC-объекты, либо
 *  ассоциированные с ними объекты (ScriptUI-объекты графического интерфейса UIControl-s, или ассоциированные с Моделями объекты).
 *  В случае успешного нахождения контролёра - возвращает ссылку на него из коллекции контролёров приложения, в противном случае - 
 *  возвращает undefined.
 *  <p>Метод удобно использовать для получения ссылки на контролёр из тел обработчиков элементов управления или объектов-моделей, указывая 
 *  методу в качестве аргумента вызова своё свойство <code>this</code>.</p>
 * 
 * @param  {object} obj MVCModel | MVCView | any - или любой объект, ассоциированный с имеющимся MVC-объектом
 * @returns {MVCController|undefined}     Возвращает ссылку на объект MVCController, в противном случае, если не найдено ни одного контролёра, 
 *                                        ассоциированного с аргументом - возвращает undefined.
 * @example <caption>Любой из вызовов поволит обнаружить ассоциированный контролёр:</caption>
 * myApp.findController(myModel); 
 * myApp.findController(myModel.value);
 * myApp.findController(myView);
 * myApp.findController(myView.control);
 * @example <caption>Получение контролёра, в обработчике элемента управления, связанного с Представлением. В данном
 *          примере создаётся модель, для которой определяется обработчик onChange - в происходит
 *          получение ссылки на контролёр и от него - на модель, после чего определяется состояние модели и в зависимости
 *          от него меняется цвет текста</caption>
 *  myApp.addView({ 
 *      id:"et", 
 *      view:"edittext { characters:30 }", 
 *      control:{
 *          onChanging:function() {
 *              // получаем ссылку на контролёр, чтобы получить ссылку
 *              // на модель, связанную с данным представлением:
 *              var ctrl = myApp.findController(this),
 *                  gfx = this.graphics;
 *              // в зависисмости от статуса модели меняем цвет текста:
 *              if (ctrl.model.isValid()) { 
 *                  gfx.foregroundColor = gfx.newPen (0, [0,0,0], 1); // gfx.PenType.SOLID_COLOR == 0
 *                  this.helpTip = "Всё хорошо";        
 *              } else {
 *                  gfx.foregroundColor = gfx.newPen (0, [1,0,0], 1);
 *                  this.helpTip = "Неправильное значение");
 *              }
 *          }
 *      }
 *  });
 */
MVCApplication.prototype.findController = function(obj) {
    var controllers = this.controllers;
    for (var i=0, max = controllers.length; i<max; i++) {
        try {  if (obj === controllers[i]||obj === controllers[i].view.control||obj === controllers[i].model||obj === controllers[i].view||
                  obj === controllers[i].view_obj||obj === controllers[i].model_obj) return controllers[i];
        } catch(e) { continue; }
    }
    return undefined;
};

// --------------------------------------------------------------
// Вспомогательные метод для быстрого поиска MVC-объектов в соответствующих коллекциях по их id
// 
/**
 * @method MVCApplication#getModelByID
 * @desc    Поиск по <code>id</code> модели в коллекции <code>MVCApplication.models</code>
 * @param   {string} id             id (идентификатор) объекта
 * @returns {MVCModel|undefined}    Возвращает ссылку на найденный объект MVCModel, если объект не обнаруживается - возвращает undefined.
 */
MVCApplication.prototype.getModelByID = function(id) {
    return this.models.getFirstByKeyValue('id', id);     
};

/**
 * @method  MVCApplication#getViewByID
 * @desc    Поиск по <code>id</code> объекта-представления в коллекции <code>MVCApplication.views</code>
 * @param   {string} id             id (идентификатор) объекта
 * @returns {MVCView|undefined}     Возвращает ссылку на найденный объект MVCView, если объект не обнаруживается - возвращает undefined.
 */    
MVCApplication.prototype.getViewByID = function(id) {
    return this.views.getFirstByKeyValue('id', id);     
};

/**
 * @method  MVCApplication#getControllerByID
 * @desc    Поиск по <code>id</code> объекта-контроллёра в коллекции <code>MVCApplication.controllers</code>
 * @param   {string} id                id (идентификатор) объекта
 * @returns {MVCController|undefined}  Возвращает ссылку на объект MVCController, если объект не обнаруживается - возвращает undefined.
 */    
MVCApplication.prototype.getControllerByID = function(id) {
    return this.controllers.getFirstByKeyValue('id', id);     
};