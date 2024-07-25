Ext.define("app.view.mainPageView", {
    extend: "Ext.grid.Panel",
    alias: "widget.mainPageView",
    title: "Данные пользователей",
    controller: "mainPageController",

    requires: [
        'app.components.selectAllButton',
        'app.components.cityPicker',
        'app.components.userPicker',
    ],

    columnLines: true,
    width: "100%",
    height: "100%",
    store: mainPageStore,
    selType: "cellmodel",

    plugins: [
        'gridfilters',
        {
            ptype: "cellediting",
            clicksToEdit: 1,
            pluginId: "cellplugin",
            listeners: {
                validateedit: 'onValidateEdit'
            },
        }
    ],

    listeners: {
        afterrender: 'onAfterrender'
    },

    viewConfig: {
        getRowClass: function (record, rowIndex, rowParams, store) {
            //добавляем каждой строке css класс, опеределяющий ее цвет
            //порядок отображения цветов зависит от расположения классов в файле main_styles.css

            let showCarOwners = Ext.getCmp('actionsButton').down('#showCarOwnersCheckbox').getValue();          //подсветить пользователей с машиной
            let showDefaultCars = Ext.getCmp('actionsButton').down('#showDefaultCarsCheckbox').getValue();      //машины с данными по умолчанию
            let showMissingData = Ext.getCmp('actionsButton').down('#showMissingDataCheckbox').getValue();      //пользователи с незаполненными данными

            let newRowClass = '';

            if (record.get('has_car_color')) {
                newRowClass = (showCarOwners) ? 'has_car' : '';
            }

            if (record.get('default_car_color')) {
                if (newRowClass) {
                    newRowClass = (showDefaultCars) ? newRowClass + ' default_cars' : newRowClass;
                } else {
                    newRowClass = (showDefaultCars) ? 'default_cars' : '';
                }
            }

            if (record.get('missing_data_color')) {
                if (newRowClass) {
                    newRowClass = (showMissingData) ? newRowClass + ' missing_data' : newRowClass;
                } else {
                    newRowClass = (showMissingData) ? 'missing_data' : '';
                }
            }

            return newRowClass;
        }
    },

    columns: [{
        xtype: "rownumberer",
    }, {
        xtype: 'actioncolumn',
        width: 60,
        menuDisabled: true,
        menuText: 'Удаление / Информация',
        items: [{
            icon: '../../resources/images/delete.gif',
            tooltip: 'Удалить запись',
            handler: 'deleteUser'
        }, '->', {
            icon: '../../resources/images/info.png',
            tooltip: 'Информация о пользователе',
            handler: 'showUserInfo'
        }]
    }, {
        text: "ID",
        dataIndex: "id_user",
        align: "center",
        hidden: true,
        width: 60,
    }, {
        text: "Пользователь",
        dataIndex: "user",
        align: "center",
        flex: 1,
        editor: {
            xtype: 'change-name-picker',
        },
        filter: {
            type: 'list',
        }
    }, {
        text: "Возраст",
        dataIndex: "age",
        align: "center",
        width: 100,
    }, {
        text: "Образование",
        dataIndex: "grade",
        align: "center",
        flex: 1,
        editor: new Ext.form.field.ComboBox({
            // typeAhead: true,
            triggerAction: 'all',
            store: comboStoreEducation,
            allowBlank: false,
            // anyMatch: true,
            editable: false,
            listConfig: {
                minWidth: 250,
                resizable: true
            }
        }),
        filter: {
            type: 'list',
        }
    }, {
        text: "Город",
        dataIndex: "city",
        align: "center",
        flex: 1,
        editor: {
            xtype: 'select-city-picker'
        },
        filter: {
            type: 'list',
        }
    }, {
        text: "Машина",
        xtype: 'checkcolumn',
        dataIndex: "has_car",
        align: "center",
        width: 100,
        listeners: {
            checkchange: 'carCheckchange'
        }
    }],

    dockedItems: [{
        xtype: "toolbar",
        dock: "bottom",
        ui: "footer",
        layout: {
            pack: "center",
        },

        items: [{
            xtype: "button",
            width: 160,
            text: "Добавить",
            tooltip: "Добавить новую запись",
            handler: 'addNewRecord'
        }, '->', {
            xtype: "button",
            width: 160,
            text: "Действия",
            id: "actionsButton",
            menu: {
                width: 400,
                padding: '5 0 5 0',
                defaults: {
                    xtype: 'checkbox',
                    inputValue: true,
                    margin: '0 0 0 10',
                    listeners: {
                        change: 'actionCheckboxFunc'
                    }
                },
                items: [{
                    itemId: 'showCarOwnersCheckbox',
                    boxLabel: 'Показать пользователей с машиной',
                    name: 'carOwners',
                }, {
                    itemId: 'showDefaultCarsCheckbox',
                    boxLabel: 'Показать машины с данными по умолчанию',
                    name: 'carOwners',
                }, {
                    itemId: 'showMissingDataCheckbox',
                    boxLabel: 'Показать пользователей с незаполненными данными',
                    name: 'carOwners',
                }],
            }
        }, '->', {
            xtype: "button",
            width: 160,
            text: "Фильтры",
            id: "filterButton",
            menu: {
                width: 160,
                items: [{
                    text: 'Пользователи',
                    itemId: 'userFilter',
                    menu: {
                        items: [{
                            xtype: 'checkboxgroup',
                            itemId: 'userCheckboxgroup',
                            hideEmptyLabel: true,
                            columns: 1,
                            width: 200,
                            scrollable: true,
                            maxHeight: 250,
                            items: [],
                            listeners: {
                                change: 'userFilterChange'
                            }
                        }, {
                            xtype: 'select-all-button',
                        }],
                    }
                }, {
                    text: 'Образование',
                    itemId: 'gradeFilter',
                    menu: {
                        items: [{
                            xtype: 'checkboxgroup',
                            itemId: 'gradeCheckboxgroup',
                            hideEmptyLabel: true,
                            columns: 1,
                            width: 250,
                            items: [],
                            listeners: {
                                change: 'gradeFilterChange'
                            }
                        }, {
                            xtype: 'select-all-button',
                        }]
                    }
                }, {
                    text: 'Город',
                    itemId: 'cityFilter',
                    menu: {
                        items: [{
                            xtype: 'checkboxgroup',
                            itemId: 'cityCheckboxgroup',
                            hideEmptyLabel: true,
                            columns: 1,
                            width: 150,
                            scrollable: true,
                            maxHeight: 250,
                            items: [],
                            listeners: {
                                change: 'cityFilterChange'
                            }
                        }, {
                            xtype: 'select-all-button',
                        }]
                    }
                }, {
                    xtype: 'menuseparator'
                }, {
                    text: 'Очистить фильтры',
                    handler: 'clearFiltersClick'
                }]
            }
        }],
    }],
});
