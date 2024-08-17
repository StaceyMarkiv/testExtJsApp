Ext.define("app.view.mainPageView", {
    extend: "Ext.panel.Panel",
    alias: "widget.mainPageView",
    header: false,
    id: 'mainPageId',
    controller: "mainPageController",

    requires: [
        'app.components.cityPicker',
        'app.components.appInfoButton',
        'app.components.selectAllButton',
        'app.components.textFilter',
        'app.components.userPicker',
        'app.view.adminPanel.adminPanelController',
        'app.view.adminPanel.adminPanelView',
        'app.view.cities.citiesController',
        'app.view.cities.citiesView',
        'app.view.education.educationController',
        'app.view.education.educationView',
        'app.view.login.loginController',
        'app.view.login.loginView',
    ],

    layout: {
        type: 'hbox',
        pack: 'start',
    },

    defaults: {
        height: '100%'
    },

    items: [{
        xtype: 'loginView',
        flex: 1,
    }, {
        xtype: 'panel',
        itemId: 'mainPanel',
        flex: 1,
        hidden: true,
        header: false,

        listeners: {
            beforeshow: 'onMainPanelBeforeshow'
        },

        layout: {
            type: 'vbox',
            pack: 'start',
        },

        defaults: {
            width: '100%'
        },

        items: [{
            xtype: 'adminPanelView',
            hidden: true,
            flex: 1,
        }, {
            xtype: 'panel',
            header: false,
            flex: 3,
            margin: '5 0 0 0',

            layout: {
                type: 'hbox',
                pack: 'start',
            },
        
            defaults: {
                height: '100%'
            },

            items: [{
                xtype: 'grid',
                header: {
                    title: "Данные пользователей",
                    items: [{
                        xtype: 'form-info-button',
                        infoWindowContent: "app/description.html"
                    }, {
                        xtype: "button",
                        text: "Выход",
                        tooltip: "Выйти из учетной записи",
                        handler: 'logOut'
                    }]
                },
                itemId: 'userInfoGrid',
                flex: 1,
        
                columnLines: true,
                frame: true,
                selType: "cellmodel",
                store: mainPageStore,
        
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
                    afterrender: 'onAfterrender',
                    cellcontextmenu: 'createContextMenu'
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
                        icon: '../resources/images/delete.gif',
                        tooltip: 'Удалить запись',
                        handler: 'deleteUser'
                    }, '->', {
                        icon: '../resources/images/info.png',
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
                    minWidth: 250,
                    flex: 1,
                    editor: {
                        xtype: 'change-name-picker',
                    },
                    filter: {
                        type: 'list',
                    },
                }, {
                    text: "Возраст",
                    dataIndex: "age",
                    align: "center",
                    width: 100,
                    tdCls: 'ageTdCls',
                    renderer: function (value, metaData, record) {
                        if (record.get('birthday_color')) {
                            //для именинника выделяем возраст цветом и шрифтом
                            metaData.tdStyle = `color: ${record.get('birthday_color')}; font-weight: bold;`;
                        }
                        return value;
                    },
                }, {
                    text: "Образование",
                    dataIndex: "grade",
                    id: "grade",
                    align: "center",
                    minWidth: 250,
                    flex: 1,
                    editor: new Ext.form.field.ComboBox({
                        id: 'educationCombobox',
                        store: comboStoreEducation,
                        // typeAhead: true,
                        triggerAction: 'all',
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
                    id: "city",
                    align: "center",
                    minWidth: 250,
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
                        xtype: 'text-filter',       //текстовый фильтр по содержимому
                        checkFields: [
                            'user',
                            'age',
                            'grade',
                            'city',
                        ]
                    }, {
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
                                text: 'Возраст',
                                itemId: 'ageFilter',
                                menu: {
                                    items: [{
                                        xtype: 'radiogroup',
                                        itemId: 'ageRadiogroup',
                                        hideEmptyLabel: true,
                                        columns: 1,
                                        width: 150,
                                        scrollable: true,
                                        maxHeight: 250,
                                        items: [{
                                            boxLabel: 'Младше 20 лет',
                                            name: 'age',
                                            inputValue: 'less_20'
                                        }, {
                                            boxLabel: '20-35 лет',
                                            name: 'age',
                                            inputValue: '20_35'
                                        }, {
                                            boxLabel: '35-50 лет',
                                            name: 'age',
                                            inputValue: '35_50'
                                        }, {
                                            boxLabel: '50-65 лет',
                                            name: 'age',
                                            inputValue: '50_65'
                                        }, {
                                            boxLabel: 'Старше 65 лет',
                                            name: 'age',
                                            inputValue: 'more_65'
                                        }, {
                                            xtype: 'menuseparator',
                                        }, {
                                            boxLabel: 'Все записи',
                                            name: 'age',
                                            inputValue: 'all',
                                            checked: true
                                        }],
                                        listeners: {
                                            change: 'ageFilterChange'
                                        }
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
            }, {
                xtype: 'panel',
                itemId: 'sidePanel',
                width: 350,
                margin: '0 0 0 5',
                frame: true,
                hidden: true,
                layout: 'fit',
        
                closable: true,
                closeAction: 'hide',
        
                collapsible: true,
                collapseMode: 'header',
                collapseDirection: 'left',
            }]
        }]
    }]
});
