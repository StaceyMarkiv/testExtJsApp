function comboStoreFunc(tableName, id, fieldName) {
    /*
        Функция для получения данных из БД для ComboBox
        
        Аргументы функции:
        tableName - название таблицы, по которой идет запрос в БД
        id - поле id этой таблицы
        fieldName - поле для отображения в ComboBox

        Функция отправляет ajax-запрос в БД для получения данных из выбранной таблицы, парсит полученные 
        данные и возвращает для дальнейшего использования следующие переменные:

        nameStore - массив наименований для отображения в ComboBox
        dataStore - хранилище данных для замены значений в редактируемых ячейках
    */

    let nameStore = [];     //наименования для отображения в ComboBox
    let dataStore = {};      //хранилище данных для замены значений в редактируемых ячейках

    Ext.Ajax.request({
        url: `app/php/get_combobox_store.php`,
        async: false,
        jsonData: Ext.util.JSON.encode([tableName, id, fieldName]),
        callback: function (opts, success, response) {
            if (success) {
                //Декодируем результат запроса к БД
                let obj = Ext.decode(response.responseText);

                for (let line of obj) {
                    nameStore.push([line[id], line[fieldName]]);

                    dataStore[line[id]] = {
                        [`${fieldName}`]: line[fieldName],
                    }
                }
            }
        }
    });

    return [nameStore, dataStore];
}

//создаем хранилища для выпадающих списков ComboBox
let [comboStoreEducation, dataStoreEducation] = comboStoreFunc('education', 'id_grade', 'grade');
let [comboStoreCity] = comboStoreFunc('cities', 'id_city', 'city_name');

//создаем хранилище таблицы
let mainPageStore = Ext.create("app.store.mainPageStore");
mainPageStore.load(function (records, operation, success) {
    //после загрузки хранилища заполняем меню кнопки "Фильтры" значениями

    let userFilterLabels = [];
    let gradeFilterLabels = [];
    let cityFilterLabels = [];

    for (let rec of records) {
        userFilterLabels.push(rec.get('user'));
        gradeFilterLabels.push(rec.get('grade'));

        let cities = rec.get('city');
        cities = cities.split(', ');
        cityFilterLabels.push(...cities);
    }

    //убираем дублирующиеся элементы
    let gradeSet = new Set(gradeFilterLabels);
    gradeFilterLabels = Array.from(gradeSet);

    let citySet = new Set(cityFilterLabels);
    cityFilterLabels = Array.from(citySet);

    userFilterLabels.sort();
    gradeFilterLabels.sort();
    cityFilterLabels.sort();

    //заполняем меню кнопки "Фильтры" значениями

    let filterButton;
    let timer = setInterval(function () {
        filterButton = Ext.getCmp('filterButton');

        //убеждаемся, что кнопка "Фильтры" уже отрисована
        if (filterButton) {
            clearInterval(timer);

            let userFilterItems = userFilterLabels.map((el, i) => {
                let newEl = {
                    boxLabel: el,
                    name: 'userItem',
                    inputValue: el,
                    checked: true,
                }
                return newEl;
            });
            let userCheckboxgroup = filterButton.down('#userFilter').down('#userCheckboxgroup');
            userCheckboxgroup.add(userFilterItems);

            let gradeFilterItems = gradeFilterLabels.map((el, i) => {
                let newEl = {
                    boxLabel: el,
                    name: 'gradeItem',
                    inputValue: el,
                    checked: true,
                }
                return newEl;
            });
            let gradeCheckboxgroup = filterButton.down('#gradeFilter').down('#gradeCheckboxgroup');
            gradeCheckboxgroup.add(gradeFilterItems);

            let cityFilterItems = cityFilterLabels.map((el, i) => {
                let newEl = {
                    boxLabel: el,
                    name: 'cityItem',
                    inputValue: el,
                    checked: true,
                }
                return newEl;
            });
            let cityCheckboxgroup = filterButton.down('#cityFilter').down('#cityCheckboxgroup');
            cityCheckboxgroup.add(cityFilterItems);
        }
    }, 1000);
});

//переопределяем работу CheckColumn (на клик правой кнопкой мыши галочка не ставится)
Ext.define('Ext.override.CheckColumn', {
    override: 'Ext.grid.column.Check',
    processEvent: function (type, view, cell, recordIndex, cellIndex, e, record, row) {
        if (type == "mousedown" && e.button > 0) return;
        return this.callParent(arguments);
    }
});

//контроллер
Ext.define('app.view.mainPageController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mainPageController',

    cityStore: comboStoreCity,      //массив всех имеющихся в БД городов
    checkedCityIds: [],             //массив id всех отмеченных в выпадающем редакторе городов
    saveFinished: true,             //индикатор окончания загрузки в БД
    id_user: null,                  //id выбранного пользователя
    loginRole: 'user',              //роль учетной записи, от имени которой произведен вход

    gridContextMenu: new Ext.menu.Menu({
        items: [{
            itemId: 'editCities',
            text: 'Редактировать список городов',
        }, {
            itemId: 'editEducation',
            text: 'Редактировать ступени образования',
        }],
    }),

    onAfterrender: function (grid) {
        /*
            Метод для обработки события окончания рендера формы
            
            Аргументы:
            grid - сама таблица

            Метод создает:
                - маску загрузки
                - tooltip для столбца "Возраст"
        */

        //создаем маску загрузки
        this.loadMask = new Ext.LoadMask({
            msg: 'Сохранение...',
            target: this.getView()
        });

        //создаем tooltip для столбца "Возраст"
        let tipBirthday = Ext.create('Ext.tip.ToolTip', {
            target: grid.getView().getId(),
            delegate: grid.getView().itemSelector + ' .ageTdCls',     //собственный tooltip для каждой ячейки столбца
            trackMouse: true,       //перемещение внутри ячейки не убирает tooltip
            style: {
                backgroundColor: 'green',
            },
            listeners: {
                //содержимое tooltip меняется динамически в зависимости от того, какой элемент вызвал tooltip
                beforeshow: function updateTipBody(tip) {
                    let tipGridView = tip.target.component;
                    let record = tipGridView.getRecord(tip.triggerElement);

                    if (record.get('birthday_color')) {
                        tip.update('У пользователя сегодня день рождения');
                    } else {
                        return false;
                    }
                }
            }
        });
    },

    onValidateEdit: function (editor, context) {
        /*
            Метод для обработки введенного в ячейку значения
            
            Аргументы:
            editor - редактор столбца
            context - данные, связанные с редактируемой ячейкой

            Метод должным образом обрабатывает введенное значение и записывает его в хранилище.
        */

        let grid = context.grid;

        //вручную перезаписываем данные ячейки в хранилище (чтобы убрать красный уголок на ячейке)
        context.cancel = true;
        context.record.data[context.field] = context.value;

        if (context.field === 'grade') {
            //обработка выбора в ComboBox
            let displayData = dataStoreEducation[context.value];
            let id = context.record.data['id_grade'];

            if (displayData) {
                context.record.data['id_grade'] = parseInt(context.value);
                context.record.data[context.field] = displayData[context.field];

                let saveParams = {
                    'idFieldValue': context.record.data['id_user'],
                    'newValues': Ext.JSON.encode({
                        'id_grade': context.record.data['id_grade'],
                    }),
                };

                this.saveFinished = false;
                this.saveChanges('users', saveParams);
            } else {
                if (context.value === context.originalValue && id !== -1) {      //если значение в ячейке не поменялось
                    displayData = dataStoreEducation[id];
                    context.record.data[context.field] = displayData[context.field];
                }
            }
        } else if (context.field === 'user') {
            //обработка измененного имени пользователя
            let nameParts = context.value.split(' ');
            let firstName = (nameParts[1]) ? nameParts[1] : '';
            let lastName = (nameParts[0]) ? nameParts[0] : '';

            context.record.data['first_name'] = firstName;
            context.record.data['last_name'] = lastName;

            let saveParams = {
                'idFieldValue': context.record.data['id_user'],
                'newValues': Ext.JSON.encode({
                    'first_name': context.record.data['first_name'],
                    'last_name': context.record.data['last_name'],
                }),
            };

            this.saveFinished = false;
            this.saveChanges('users', saveParams);
        } else if (context.field === 'city') {
            if (context.value !== context.originalValue) {
                let saveParams = {
                    'id_user': context.record.data['id_user'],
                    'id_city': Ext.JSON.encode(this.checkedCityIds),
                };

                this.saveFinished = false;
                this.saveChanges('user_cities', saveParams);
                this.checkedCityIds = [];
            }
        }

        //обновляем запись в таблице
        context.record.commit();
        grid.getView().refreshNode();
    },

    addNewRecord: function (button) {
        /*
            Метод для обработки нажатия на кнопку "Добавить"
            
            Аргументы:
            button - сама кнопка

            Метод вызывает всплывающее окно с полями для заполнения, после заполнения отправляет
            введенные данные в БД и перезагружает хранилище основной таблицы.
        */

        let me = this;
        let mainGrid = button.up('grid');

        let win = Ext.create('Ext.window.Window', {
            title: 'Добавление нового пользователя',
            height: 260,
            width: 400,
            layout: 'fit',
            controller: me,
            modal: true,

            listeners: {
                beforeclose: function () {
                    //возвращаем привязку контроллера к основной форме
                    Ext.getCmp('mainPageId').setController(me);
                },
                close: function () {
                    me.checkedCityIds = [];
                },
            },

            items: {
                xtype: 'form',
                itemId: 'newUserForm',
                padding: '10 5 5 5',

                defaults: {
                    labelAlign: 'left',
                    labelWidth: 100,
                    anchor: '100%',
                },

                items: [{
                    xtype: 'textfield',
                    itemId: 'firstName',
                    fieldLabel: 'Имя',
                    name: 'firstName',
                    allowBlank: false,
                }, {
                    xtype: 'textfield',
                    itemId: 'lastName',
                    fieldLabel: 'Фамилия',
                    name: 'lastName',
                    allowBlank: false,
                }, {
                    xtype: 'datefield',
                    itemId: 'birthday',
                    fieldLabel: 'Дата рождения',
                    name: 'birthday',
                    format: 'Y-m-d',
                }, {
                    xtype: 'combobox',
                    itemId: 'education',
                    fieldLabel: 'Образование',
                    name: 'grade',
                    // typeAhead: true,
                    triggerAction: 'all',
                    store: comboStoreEducation,
                    // anyMatch: true,
                    editable: false,
                    listConfig: {
                        minWidth: 250,
                        resizable: true
                    }
                }, {
                    xtype: 'select-city-picker',
                    itemId: 'city',
                    fieldLabel: 'Город',
                    name: 'city',
                }, {
                    xtype: 'checkbox',
                    itemId: 'hasCar',
                    fieldLabel: 'Машина',
                    name: 'hasCar',
                    inputValue: true,
                    handler: function (checkbox, newValue) {
                        //если стоит галочка, показываем поля для заполнения данных о машине
                        //если галочка убрана, эти поля скрываем

                        if (newValue) {
                            win.setHeight(win.getHeight() + 60);
                            checkbox.up('form').down('#carBrand').show();
                            checkbox.up('form').down('#color').show();
                        } else {
                            win.setHeight(win.getHeight() - 60);
                            checkbox.up('form').down('#carBrand').hide();
                            checkbox.up('form').down('#color').hide();
                        }
                    }
                }, {
                    xtype: 'textfield',
                    itemId: 'carBrand',
                    fieldLabel: 'Марка машины',
                    name: 'car_brand',
                    allowBlank: false,
                    emptyText: 'new_car',
                    hidden: true,
                }, {
                    xtype: 'textfield',
                    itemId: 'color',
                    fieldLabel: 'Цвет',
                    name: 'color',
                    allowBlank: false,
                    emptyText: 'new_color',
                    hidden: true,
                }],

                buttons: [{
                    xtype: "button",
                    width: 160,
                    text: "Добавить",
                    tooltip: "Добавить новую запись",
                    handler: function () {
                        let form = this.up('window').down('#newUserForm');
                        let values = form.getValues();

                        if (values['firstName'] === '' || values['lastName'] === '') {
                            Ext.Msg.alert('Предупреждение', 'Заполните имя и фамилию пользователя');
                        } else {
                            //приводим значения параметров к нужному виду (при необходимости)
                            values['id_city'] = Ext.JSON.encode(me.checkedCityIds);

                            if (values['grade'] === '') {
                                values['grade'] = 0;
                            }

                            values['hasCar'] = (values['hasCar']) ? `${values['hasCar']}` : 'false';     //отправлять в виде строки, иначе при конвертации false потеряется

                            me.loadMask.show();

                            // добавляем новую запись в БД
                            Ext.Ajax.request({
                                url: `app/php/add_user.php`,
                                params: values,
                                callback: function (opts, success, response) {
                                    let res = Ext.decode(response.responseText);

                                    if (res.success) {
                                        me.loadMask.hide();

                                        mainGrid.getStore().load();
                                    }
                                }
                            });

                            win.close();
                        }
                    }
                }]
            }
        })
        win.show();
    },

    deleteUser: function (grid, rowIndex, colIndex) {
        /*
            Метод для удаления записи
            
            Аргументы:
            grid - сама таблица
            rowIndex - индекс строки в локальном хранилище
            colIndex - индекс столбца

            Метод удаляет выбранную запись из локального хранилища и из БД.
        */

        let me = this;

        Ext.Msg.show({
            title: 'Предупреждение',
            message: 'Вы точно хотите удалить пользователя?',
            width: 300,
            buttons: Ext.Msg.OKCANCEL,
            icon: Ext.window.MessageBox.WARNING,
            fn: function (btn) {
                if (btn === 'ok') {
                    let store = grid.getStore();
                    let id_user = store.getAt(rowIndex).get('id_user');

                    //удаляем из локального хранилища
                    store.removeAt(rowIndex);

                    me.loadMask.show();

                    //удаляем из БД
                    Ext.Ajax.request({
                        url: `app/php/delete_user.php`,
                        params: { 'id_user': id_user },
                        callback: function (opts, success, response) {
                            let res = Ext.decode(response.responseText);

                            if (res.success) {
                                me.loadMask.hide();
                            }
                        }
                    });
                }
            },
        });
    },

    saveChanges: function (dbTable, saveParams) {
        /*
            Метод для сохранения в БД измененного значения
            
            Аргументы:
            dbTable - таблица, в которую сохранять изменения
            saveParams - параметры для сохранения

            Метод передает указанные параметры для сохранения информации в БД.
        */

        let me = this;
        me.loadMask.show();

        Ext.Ajax.request({
            url: `app/php/update_${dbTable}.php`,
            params: saveParams,
            callback: function (opts, success, response) {
                let res = Ext.decode(response.responseText);

                if (res.success) {
                    me.loadMask.hide();
                    me.saveFinished = true;
                }
            }
        });
    },

    userFilterChange: function (checkboxgroup, newValue) {
        /*
            Метод для обработки постановки/снятия галочек в фильтре "Пользователи"
            
            Аргументы:
            checkboxgroup - меню с галочками в фильтре "Пользователи"
            newValue - все отмеченные на данный момент галочками поля

            Метод добавляет к фильтрам хранилища функцию для фильтрации хранилища по полю 'user'.
        */

        let grid = checkboxgroup.up('grid');
        let filters = grid.getStore().getFilters();

        if (this.userFilter) {
            filters.remove(this.userFilter);
            this.userFilter = null;
        }

        //функция фильтрации хранилища по полю 'user'
        function userFilterFunc(item) {
            if (newValue['userItem']) {
                for (const key in item.data) {
                    if (key === 'user' && newValue['userItem'].includes(item.data[key])) {
                        return true;
                    }
                }
            } else {
                return false;
            }

            return false;
        }

        this.userFilter = filters.add(userFilterFunc);
    },

    gradeFilterChange: function (checkboxgroup, newValue) {
        /*
            Метод для обработки постановки/снятия галочек в фильтре "Образование"
            
            Аргументы:
            checkboxgroup - меню с галочками в фильтре "Образование"
            newValue - все отмеченные на данный момент галочками поля

            Метод добавляет к фильтрам хранилища функцию для фильтрации хранилища по полю 'grade'.
        */

        let grid = checkboxgroup.up('grid');
        let filters = grid.getStore().getFilters();

        if (this.gradeFilter) {
            filters.remove(this.gradeFilter);
            this.gradeFilter = null;
        }

        //функция фильтрации хранилища по полю 'grade'
        function gradeFilterFunc(item) {
            if (newValue['gradeItem']) {
                for (const key in item.data) {
                    if (key === 'grade' && newValue['gradeItem'].includes(item.data[key])) {
                        return true;
                    }
                }
            } else {
                return false;
            }

            return false;
        }

        this.gradeFilter = filters.add(gradeFilterFunc);
    },

    cityFilterChange: function (checkboxgroup, newValue) {
        /*
            Метод для обработки постановки/снятия галочек в фильтре "Город"
            
            Аргументы:
            checkboxgroup - меню с галочками в фильтре "Город"
            newValue - все отмеченные на данный момент галочками поля

            Метод добавляет к фильтрам хранилища функцию для фильтрации хранилища по полю 'city'.
        */

        let grid = checkboxgroup.up('grid');
        let filters = grid.getStore().getFilters();

        if (this.cityFilter) {
            filters.remove(this.cityFilter);
            this.cityFilter = null;
        }

        //функция фильтрации хранилища по полю 'city'
        function cityFilterFunc(item) {
            let filterValues = newValue['cityItem'];

            if (filterValues) {
                for (const key in item.data) {
                    if (key === 'city') {
                        let cities = item.data[key].split(', ');

                        if (!Array.isArray(filterValues)) {
                            filterValues = [filterValues];
                        }

                        let set1 = new Set(cities);
                        let set2 = new Set(filterValues);

                        //находим элементы, имеющиеся в обеих коллекциях
                        let intersection = new Set([...set1].filter(element => set2.has(element)));

                        if (intersection.size > 0) {
                            return true;
                        }
                    }
                }
            } else {
                return false;
            }

            return false;
        }

        this.cityFilter = filters.add(cityFilterFunc);
    },

    ageFilterChange: function (radiogroup, newValue) {
        /*
            Метод для обработки выбора в фильтре "Возраст"
            
            Аргументы:
            radiogroup - меню выбора в фильтре "Возраст"
            newValue - выбранное в данный момент значение

            Метод добавляет к фильтрам хранилища функцию для фильтрации хранилища по полю 'age'.
        */

        let grid = radiogroup.up('grid');
        let filters = grid.getStore().getFilters();

        if (this.ageFilter) {
            filters.remove(this.ageFilter);
            this.ageFilter = null;
        }

        //функция фильтрации хранилища по полю 'age'
        function ageFilterFunc(item) {
            if (newValue['age'] === 'all') {
                return true;
            } else {
                let ageLimits = newValue['age'].split('_');

                if (ageLimits[0] === 'less') {
                    return (item.get('age') < parseInt(ageLimits[1]) && item.get('age') !== null);

                } else if (ageLimits[0] === 'more') {
                    return item.get('age') >= parseInt(ageLimits[1]);

                } else {
                    return (item.get('age') >= parseInt(ageLimits[0]) && item.get('age') < parseInt(ageLimits[1]));
                }
            }
        }

        this.ageFilter = filters.add(ageFilterFunc);
    },

    clearFiltersClick: function (menuItem) {
        /*
            Метод для обработки нажатия на пункт меню "Очистить фильтры"
            
            Аргументы:
            menuItem - нажимаемый пункт меню

            Метод очищает все активные фильтры хранилища и расставляет на место снятые галочки.
        */

        let grid = menuItem.up('grid');
        let store = grid.getStore();
        let filters = store.getFilters();

        if (filters.length > 0) {
            store.clearFilter();

            let userCheckboxgroup = Ext.getCmp('filterButton').down('#userCheckboxgroup');
            userCheckboxgroup.eachBox(function (el) {
                el.setValue(true);
            });

            let gradeCheckboxgroup = Ext.getCmp('filterButton').down('#gradeCheckboxgroup');
            gradeCheckboxgroup.eachBox(function (el) {
                el.setValue(true);
            });

            let cityCheckboxgroup = Ext.getCmp('filterButton').down('#cityCheckboxgroup');
            cityCheckboxgroup.eachBox(function (el) {
                el.setValue(true);
            });

            let ageRadiogroup = Ext.getCmp('filterButton').down('#ageRadiogroup');
            ageRadiogroup.setValue({
                age: 'all'
            });
        }
    },

    carCheckchange: function (checkcolumn, rowIndex, checked) {
        /*
            Метод для обработки галочки в столбце "Машина"
            
            Аргументы функции:
            checkcolumn - сам столбец
            rowIndex - индекс строки, в которой произошло изменение
            checked - true, если в ячейке стоит галочка
 
            Метод выполняет следующие действия:
                - обрабатывает клик по столбцу checkcolumn и добавляет / убирает параметр для класса
                    подсветки записи
                - при постановке галочки открывает всплывающее окно для внесения информации о машине
                - сохраняет все изменения в БД
        */

        let me = this;
        let grid = checkcolumn.up('grid');
        let changedRecord = grid.getStore().getAt(rowIndex);      //запись, в которой сделаны изменения

        //меняем подсветку записи в зависимости от наличия / отсутствия галочки
        changedRecord.set({
            has_car_color: (checked) ? 'blue' : '',
        });
        if (changedRecord.get('default_car_color')) {
            changedRecord.set({
                default_car_color: (checked) ? 'red' : '',
            });
        }

        changedRecord.commit();

        me.id_user = changedRecord.get('id_user');

        let saveParams = {
            'idFieldValue': me.id_user,
            'newValues': Ext.JSON.encode({
                'has_car': `${checked}`,        //отправлять в виде строки, иначе при конвертации false потеряется
            }),
        };

        me.saveFinished = false;
        me.saveChanges('users', saveParams);

        if (checked) {
            let timer = setInterval(function () {
                //убеждаемся, что сохранение в БД окончено
                if (me.saveFinished) {
                    clearInterval(timer);

                    //вызываем форму заполнения данных о машине
                    me.addNewCar();
                }
            }, 500);
        }
    },

    addNewCar: function () {
        /*
            Метод для создания всплывающего окна с полями для заполнения информации о новой машине.
            После заполнения отправляет введенные данные в БД.
        */

        let me = this;

        let win = Ext.create('Ext.window.Window', {
            title: 'Добавление машины пользователя',
            height: 140,
            width: 400,
            layout: 'fit',

            listeners: {
                beforeclose: function () {
                    //возвращаем привязку контроллера к основной форме
                    Ext.getCmp('mainPageId').setController(me);
                },
                close: function () {
                    //добавляем записи цветовые метки
                    let store = me.getView().down('#userInfoGrid').getStore();
                    let selectedRec = store.findRecord('id_user', me.id_user, 0, false, false, true);
                    selectedRec.set({
                        has_car_color: 'blue',
                        default_car_color: 'red',
                    });

                    me.id_user = null;
                }
            },

            items: {
                xtype: 'form',
                itemId: 'newCarForm',
                padding: 5,

                defaults: {
                    labelAlign: 'left',
                    labelWidth: 100,
                    anchor: '100%',
                },

                items: [{
                    xtype: 'textfield',
                    itemId: 'carBrand',
                    fieldLabel: 'Марка машины',
                    name: 'carBrand',
                    allowBlank: false,
                    emptyText: 'new_car',
                }, {
                    xtype: 'textfield',
                    itemId: 'color',
                    fieldLabel: 'Цвет',
                    name: 'color',
                    allowBlank: false,
                    emptyText: 'new_color',
                }],

                buttons: [{
                    xtype: "button",
                    width: 160,
                    text: "Добавить",
                    tooltip: "Добавить машину",
                    handler: function () {
                        let form = this.up('window').down('#newCarForm');
                        let values = form.getValues();

                        if (values['carBrand'] === '' || values['color'] === '') {
                            Ext.Msg.alert('Предупреждение', 'Заполните информацию о машине');
                        } else {
                            values['idFieldValue'] = me.id_user;

                            me.loadMask.show();

                            // добавляем новую запись в БД
                            Ext.Ajax.request({
                                url: `app/php/add_car.php`,
                                params: values,
                                callback: function (opts, success, response) {
                                    let res = Ext.decode(response.responseText);

                                    if (res.success) {
                                        me.loadMask.hide();

                                        me.id_user = null;

                                        me.getView().down('#userInfoGrid').getView().refresh();
                                    }
                                }
                            });

                            win.close();
                        }
                    }
                }]
            }
        })
        win.show();
    },

    actionCheckboxFunc: function (checkbox, newValue) {
        /*
            Метод для обработки постановки/снятия галочки в чекбоксе в меню кнопки 'Действия'
            
            Аргументы:
            checkbox - сам чекбокс
            newValue - стоит ли галочка (true / false)

            Метод обновляет форму для отображения новой подсветки записей.
        */

        checkbox.up('grid').getView().refresh();
    },

    showUserInfo: function (grid, rowIndex, colIndex) {
        /*
            Метод для просмотра информации о пользователе
            
            Аргументы:
            grid - сама таблица
            rowIndex - индекс строки в локальном хранилище
            colIndex - индекс столбца

            Метод открывает всплывающее окно с полной инфрмацией о пользователе. Всю иинформацию можно редактировать.
            По кнопке "Сохранить" все изменения отправляются в БД.
        */

        let me = this;

        let selectedRecord = grid.getStore().getAt(rowIndex);
        let id_user = selectedRecord.get('id_user');

        //отправляем запрос в БД по выбранному пользователю
        Ext.Ajax.request({
            url: `app/php/get_user_data.php`,
            params: {
                'id_user': id_user,
            },
            callback: function (opts, success, response) {
                if (success) {
                    //Декодируем результат запроса к БД
                    let obj = Ext.decode(response.responseText);

                    sourceData = obj[0];
                    displayNames = obj[1];

                    //добавляем в sourceConfig необходимые параметры
                    sourceConfig = {};
                    for (const key in displayNames) {
                        switch (key) {
                            case 'birthday':
                                sourceConfig[key] = {
                                    displayName: displayNames[key],
                                    renderer: Ext.util.Format.dateRenderer('Y-m-d'),
                                    editor: {
                                        xtype: 'datefield',
                                        format: 'Y-m-d',
                                    },
                                }
                                break;
                            case 'grade':
                                sourceConfig[key] = {
                                    displayName: displayNames[key],
                                    editor: {
                                        xtype: 'combobox',
                                        triggerAction: 'all',
                                        store: comboStoreEducation,
                                        editable: false,
                                        listConfig: {
                                            minWidth: 250,
                                            resizable: true
                                        }
                                    },
                                }
                                break;
                            case 'city':
                                sourceConfig[key] = {
                                    displayName: displayNames[key],
                                    editor: {
                                        xtype: 'select-city-picker',
                                    },
                                }
                                break;
                            default:
                                sourceConfig[key] = {
                                    displayName: displayNames[key],
                                    renderer: function (value, metaData) {
                                        metaData.style = "white-space: normal;";
                                        return value;
                                    }
                                }
                        }
                    }

                    //окно с информацией об пользователе
                    let win = Ext.create('Ext.window.Window', {
                        title: 'Информация о пользователе',
                        scrollable: true,
                        modal: true,

                        listeners: {
                            beforeclose: function () {
                                //возвращаем привязку контроллера к основной форме
                                Ext.getCmp('mainPageId').setController(me);
                            }
                        },

                        items: [{
                            xtype: 'propertygrid',
                            width: 450,
                            nameColumnWidth: 150,
                            hideHeaders: true,
                            emptyText: 'Элементы для отображения отсутствуют',
                            controller: me,

                            id_grade: null,     //параметр для хранения id выбранной новой ступени образования

                            listeners: {
                                validateedit: function (editor, context) {
                                    /*
                                        Метод для обработки введенного в ячейку значения
                    
                                        Аргументы функции:
                                        editor - редактор столбца
                                        context - данные, связанные с редактируемой ячейкой
                    
                                        Функция должным образом обрабатывает введенное значение и записывает его в хранилище.
                                    */

                                    let propertygrid = context.grid;

                                    if (context.record.data['name'] === 'grade') {
                                        //обработка выбора в ComboBox
                                        let displayData = dataStoreEducation[context.value];

                                        if (displayData) {
                                            if (displayData[context.record.data['name']] !== context.originalValue) {
                                                //если выбор в ComboBox не равен исходному значению
                                                context.record.data['value'] = displayData[context.record.data['name']];
                                                propertygrid['id_grade'] = parseInt(context.value);     //сохраняем id выбранной новой ступени образования
                                            }
                                        } else {
                                            if (context.value === context.originalValue) {
                                                //если значение в ячейке не поменялось
                                                displayData = dataStoreEducation[propertygrid['id_grade']];

                                                if (displayData) {
                                                    context.record.data['value'] = displayData[context.record.data['name']];
                                                } else {
                                                    context.record.data['value'] = context.value;
                                                }
                                            }
                                        }
                                    }

                                    propertygrid.getView().refresh();
                                }
                            },
                        }],

                        dockedItems: [{
                            xtype: "toolbar",
                            dock: "bottom",
                            ui: "footer",
                            layout: {
                                pack: "end",
                            },

                            items: [{
                                xtype: "button",
                                width: 160,
                                text: "Сохранить",
                                tooltip: "Сохранить изменения в базу данных",
                                handler: function () {
                                    let infoGrid = this.up('window').down('propertygrid');
                                    let userData = infoGrid.getSource();

                                    if (userData['car_brand'] || userData['color']) {       //отправлять в виде строки, иначе при конвертации false потеряется
                                        userData['has_car'] = 'true';
                                    } else {
                                        userData['has_car'] = 'false';
                                    }

                                    //считываем сохраненное значение id_grade
                                    userData['id_grade'] = infoGrid['id_grade'];

                                    //если текущие города не менялись
                                    if (userData['city'] && me.checkedCityIds.length === 0) {
                                        me.checkedCityIds.push(-1);
                                    }

                                    delete userData['city'];
                                    delete userData['grade'];

                                    //сохраняем данные пользователя
                                    let saveUserParams = {
                                        'idFieldValue': id_user,
                                        'newValues': Ext.JSON.encode(userData),
                                    };
                                    me.saveFinished = false;
                                    me.saveChanges('users', saveUserParams);

                                    infoGrid['id_grade'] = null;

                                    let timer = setInterval(function () {
                                        //убеждаемся, что сохранение в БД окончено
                                        if (me.saveFinished) {
                                            clearInterval(timer);

                                            //сохраняем данные о городах
                                            let saveCitiesParams = {
                                                'id_user': id_user,
                                                'id_city': Ext.JSON.encode(me.checkedCityIds),
                                            };
                                            me.saveFinished = false;
                                            me.saveChanges('user_cities', saveCitiesParams);

                                            //перезагружаем хранилище основной таблицы
                                            grid.getStore().load();

                                            win.close();
                                        }
                                    }, 500);
                                }
                            }]
                        }]
                    });

                    //заполнение таблицы с информацией об пользователе
                    let infoWindowTable = win.down('propertygrid');
                    infoWindowTable.getStore().sorters.items = [];      //убираем сортировку левого столбца по алфавиту (записи будут в порядке, полученном из БД)
                    infoWindowTable.setSource(sourceData, sourceConfig);

                    win.show();
                }
            }
        });
    },

    createContextMenu: function (grid, td, cellIndex, record, tr, rowIndex, event) {
        /*
            Метод для обработки вызова контекстного меню на ячейке нажатием правой кнопки мыши
                
            Аргументы функции:
            grid - сама таблица
            td - html элемент (TD) таблицы для выбранной ячейки
            cellIndex - индекс выбранной ячейки
            record - строка с данными хранилища, содержащая выбранную ячейку
            tr - html элемент (TR) таблицы для выбранной ячейки
            rowIndex - индекс строки таблицы с выбранной ячейкой
            event - событие нажатия кнопки

            Метод выполняет следующие действия:
            - обрабатывает нажатие правой кнопки мыши и вызывает специализированное контекстное меню
            только для столбцов "Город" и "Образование"
            - в зависимости от роли учетной записи активирует / деактивирует контекстное меню
        */

        event.stopEvent();

        let thisColumnId = td.dataset.columnid;     //id выбранного столбца

        let educationMenuItem = this.gridContextMenu.getComponent('editEducation');
        let cityMenuItem = this.gridContextMenu.getComponent('editCities');

        if (this.loginRole === 'user') {
            educationMenuItem.disable();
            cityMenuItem.disable();
        } else {
            educationMenuItem.enable();
            cityMenuItem.enable();
        }

        if (['grade', 'city'].includes(thisColumnId)) {
            if (thisColumnId === 'grade') {
                cityMenuItem.hide();
                educationMenuItem.show();

                //чтобы передать новые параметры, нужно сначала удалить предыдущий обработчик
                educationMenuItem.un("click", this.showSidePanel, this);
                educationMenuItem.on("click", this.showSidePanel, this, {
                    'showComponent': 'educationForm',
                });

            } else if (thisColumnId === 'city') {
                cityMenuItem.show();
                educationMenuItem.hide();

                //чтобы передать новые параметры, нужно сначала удалить предыдущий обработчик
                cityMenuItem.un("click", this.showSidePanel, this);
                cityMenuItem.on("click", this.showSidePanel, this, {
                    'showComponent': 'cityForm',
                });
            }

            this.gridContextMenu.showAt(event.getXY());
        }
    },

    showSidePanel: function (menuitem, event, formInfo) {
        /*
            Метод для вызова боковой панели из контекстного меню
            
            Аргументы:
            menuitem - нажатый пункт меню
            event - событие нажатия
            formInfo - дополнительная переданная информация

            Метод открывает боковую панель и заполняет ее данными в соответствии с переданной доп. информацией.
        */

        let sidePanel = Ext.getCmp('mainPageId').down('#sidePanel');
        sidePanel.removeAll();

        if (formInfo['showComponent'] === 'educationForm') {
            sidePanel.setTitle('Образование');
            sidePanel.panelContent = 'education';

            sidePanel.add({
                xtype: 'educationView'
            });


        } else if (formInfo['showComponent'] === 'cityForm') {
            sidePanel.setTitle('Города');
            sidePanel.panelContent = 'cities';

            sidePanel.add({
                xtype: 'citiesView'
            });
        }

        sidePanel.show();
    },

    logOut: function (button) {
        /*
            Метод для обработки нажатия на кнопку "Выход"
            
            Аргументы:
            button - кнопка "Выход"

            Метод производит выход из учетной записи, скрывает основную форму и показывает
            стартовую форму ввода логина и пароля. 
        */

        Ext.Msg.show({
            title: 'Предупреждение',
            message: 'Вы точно хотите выйти из учетной записи?',
            width: 300,
            buttons: Ext.Msg.OKCANCEL,
            defaultFocus: 3,        //фокус на кнопке "Отмена"
            icon: Ext.window.MessageBox.WARNING,
            fn: function (btn) {
                if (btn === 'ok') {
                    let mainPanel = button.up('grid').up('#mainPanel');
                    mainPanel.hide();

                    let loginFrom = mainPanel.up('#mainPageId').down('loginView');
                    loginFrom.show();
                    loginFrom.down('form').reset();
                }
            },
        });
    },

    onMainPanelBeforeshow: function (panel) {
        /*
            Метод для обработки события перед показом главной панели (с формой основной информации и 
            админской панелью)
            
            Аргументы:
            panel - сама главной панель

            Метод проверяет роль учетной записи, произведшей вход, и по необходимости скрывает / показывает
            админскую панель. 
        */

        let adminPanel = panel.down('adminPanelView');

        if (this.loginRole === 'admin') {
            adminPanel.show();
        } else {
            adminPanel.hide();
        }
    },
});

/*
TODO:
- меню со статистикой в кнопку "Действия":
    - статистика по машинам
    - статистика по городам
    Статистика отображается в виде диаграмм (столбчатая, круговая) на боковой панели.
    Снизу под диаграммой связанная инфа (может быть в виде таблицы)
    Диаграмму можно увеличить на весь экран по кнопке
    Диаграммы можно сохранять в png
- изменить логику столбца "Машины":
    - привязка true/false находится в таблице cars
    - при снятии галочки машина не удаляется, ей ставится метка false
    - при постановке галочки проверяется, если у пользователя машина есть - ей ставится true, если нет - вносится новая
    - новая машина добавляется по кнопке "+"
- кнопка с информацией, которая считывает README. Если нет интернета, загружается короткое дефолтное описание
*/