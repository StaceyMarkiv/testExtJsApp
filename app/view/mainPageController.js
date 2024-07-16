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

//создаем хранилище для выпадающего списка ComboBox
let [comboStoreEducation, dataStoreEducation] = comboStoreFunc('education', 'id_grade', 'grade');
let [comboStoreCity] = comboStoreFunc('cities', 'id_city', 'city_name');

//создание хранилища
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

Ext.define('app.view.mainPageController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mainPageController',

    cityStore: comboStoreCity,      //массив всех имеющихся в БД городов
    checkedCityIds: [],             //массив id всех отмеченных в выпадающем редакторе городов

    onAfterrender: function () {
        //создаем маску загрузки
        this.loadMask = new Ext.LoadMask({
            msg: 'Сохранение...',
            target: this.getView()
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

                this.saveChanges('users', saveParams);
            } else {
                if (context.value === context.originalValue && id !== -1) {      //если значение в ячейке не поменялось
                    displayData = dataStoreEducation[id];
                    context.record.data[context.field] = displayData[context.field];
                } else {
                    //всплывающее окно предупреждения
                    Ext.Msg.show({
                        title: 'Предупреждение',
                        message: 'Выберите значение из списка',
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.WARNING,
                        fn: function (btn) {
                            if (btn === 'ok') {
                                //активируем редактор в столбце
                                let cellEditing = grid.getPlugin('cellplugin');

                                cellEditing.startEditByPosition({
                                    row: context.rowIdx,
                                    column: context.colIdx + 1      //"+1", т.к. есть скрытый столбец
                                });
                            }
                        }
                    });
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

            this.saveChanges('users', saveParams);
        } else if (context.field === 'city') {
            if (context.value !== context.originalValue) {
                let saveParams = {
                    'id_user': context.record.data['id_user'],
                    'id_city': Ext.JSON.encode(this.checkedCityIds),
                };

                this.saveChanges('user_cities', saveParams);
                this.checkedCityIds = [];

            }
        }

        //обновляем таблицу
        grid.getView().refresh();
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
            height: 200,
            width: 400,
            layout: 'fit',
            controller: me,

            listeners: {
                close: function () {
                    me.checkedCityIds = [];
                }
            },

            items: {
                xtype: 'form',
                itemId: 'newUserForm',
                padding: 5,

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
                            values['id_city'] = Ext.JSON.encode(me.checkedCityIds);

                            if (values['grade'] === '') {
                                values['grade'] = 0;
                            }

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

            Метод передает удаляет выбранную запись из локального хранилища и из БД.
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
        }
    },
});