//создаем хранилище таблицы
let adminPanelStore = Ext.create("app.store.adminPanelStore");
adminPanelStore.load();

//создаем хранилище для выпадающего списка ComboBox
let [comboStoreRole, dataStoreRole] = comboStoreFunc('roles', 'id_role', 'role');

//контроллер
Ext.define('app.view.adminPanel.adminPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.adminPanelController',

    roleTooltipCreate: function (view) {
        //Метод для создания tooltip для столбца "Роль"

        view.tip = Ext.create('Ext.tip.ToolTip', {
            target: view.getId(),
            delegate: view.itemSelector + ' .roleTdCls',     //собственный tooltip для каждой ячейки столбца
            trackMouse: true,       //перемещение внутри ячейки не убирает tooltip
            listeners: {
                //содержимое tooltip меняется динамически в зависимости от того, какой элемент вызвал tooltip
                beforeshow: function updateTipBody(tip) {
                    let tipGridView = tip.target.component;
                    let record = tipGridView.getRecord(tip.triggerElement);

                    tip.update(record.get('description'));
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
        let field = context.field;

        //вручную перезаписываем данные ячейки в хранилище (чтобы убрать красный уголок на ячейке)
        context.cancel = true;

        if (field === 'role') {
            //обработка выбора в ComboBox
            let displayData = dataStoreRole[context.value];
            let id = context.record.data['id_role'];

            if (displayData) {
                context.record.data['id_role'] = parseInt(context.value);
                context.record.data[field] = displayData[field];
            } else {
                if (context.value === context.originalValue && id !== -1) {      //если значение в ячейке не поменялось
                    displayData = dataStoreRole[id];
                    context.record.data[field] = displayData[field];
                }
            }

            field = 'id_role';      //на сохранение отправляем выбранное значение id_role
        } else {
            context.record.data[field] = context.value;
        }

        //обновляем запись в таблице
        context.record.commit();
        grid.getView().refreshNode();

        let saveParams = {
            'id': context.record.data['id'],
            [field]: context.record.data[field],
            'action': 'update'
        };

        this.getView().lookupController(true).saveChanges('logins', saveParams);
    },

    addNewRecord: function (button) {
        /*
            Метод для обработки нажатия на кнопку "Добавить новую учетную запись"
            
            Аргументы:
            button - сама кнопка

            Метод вызывает всплывающее окно с полями для заполнения, после заполнения отправляет
            введенные данные в БД и перезагружает хранилище админской панели.
        */

        let me = this;
        let adminGrid = button.up('grid');

        let win = Ext.create('Ext.window.Window', {
            title: 'Добавление новой учетной записи',
            height: 250,
            width: 400,
            layout: 'fit',
            modal: true,

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
                    itemId: 'login',
                    fieldLabel: 'Логин',
                    name: 'login',
                    allowBlank: false,
                }, {
                    xtype: 'textfield',
                    itemId: 'password',
                    fieldLabel: 'Пароль',
                    name: 'password',
                    allowBlank: false,
                }, {
                    xtype: 'textfield',
                    itemId: 'first_name',
                    fieldLabel: 'Имя',
                    name: 'first_name',
                    allowBlank: true,
                }, {
                    xtype: 'textfield',
                    itemId: 'last_name',
                    fieldLabel: 'Фамилия',
                    name: 'last_name',
                    allowBlank: true,
                }, {
                    xtype: 'combobox',
                    itemId: 'role',
                    fieldLabel: 'Роль',
                    name: 'role',
                    store: comboStoreRole,
                    triggerAction: 'all',
                    allowBlank: false,
                    editable: false,
                }],

                buttons: [{
                    xtype: "button",
                    width: 160,
                    text: "Добавить",
                    tooltip: "Добавить новую запись",
                    handler: function () {
                        let form = this.up('window').down('#newUserForm');
                        let values = form.getValues();

                        if (values['login'] === '' || values['password'] === '') {
                            Ext.Msg.alert('Предупреждение', 'Заполните логин и пароль');
                        } else {
                            values['action'] = 'add';

                            let mainController = me.getView().lookupController(true);
                            mainController.saveFinished = false;
                            mainController.saveChanges('logins', values);

                            let timer = setInterval(function () {
                                //убеждаемся, что сохранение в БД окончено
                                if (mainController.saveFinished) {
                                    clearInterval(timer);

                                    //обновляем хранилище админской панели
                                    adminGrid.getStore().load();
                                }
                            }, 500);

                            win.close();
                        }
                    }
                }]
            }
        })
        win.show();
    },

    deleteRecord: function (grid, rowIndex, colIndex) {
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
            message: 'Вы точно хотите удалить запись?',
            width: 300,
            buttons: Ext.Msg.OKCANCEL,
            icon: Ext.window.MessageBox.WARNING,
            fn: function (btn) {
                if (btn === 'ok') {
                    let store = grid.getStore();

                    let saveParams = {
                        'id': store.getAt(rowIndex).get('id'),
                        'action': 'delete'
                    };

                    let mainController = me.getView().lookupController(true);
                    mainController.saveFinished = false;
                    mainController.saveChanges('logins', saveParams);

                    let timer = setInterval(function () {
                        //убеждаемся, что сохранение в БД окончено
                        if (mainController.saveFinished) {
                            clearInterval(timer);

                            //обновляем хранилище админской панели
                            grid.getStore().load();
                        }
                    }, 500);
                }
            },
        });
    },
});