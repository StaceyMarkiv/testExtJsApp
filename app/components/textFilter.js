
//текстовый фильтр по содержимому
Ext.define('app.components.textFilter', {
    extend: 'Ext.form.Panel',
    xtype: 'text-filter',
    itemId: 'textFilterId',
    frame: false,
    layout: 'hbox',

    checkFields: [],        //список полей, в которых работает фильтр

    items: [{
        xtype: 'textfield',
        itemId: 'textFilterField',
        width: 190,
        height: 25,
        hideLabel: true,
        emptyText: 'Фильтр по содержимому',
        enableKeyEvents: true,
        listeners: {
            keyup: function (textfield, event) {
                /*
                    Метод для установки на хранилище текстового фильтра
        
                    Аргументы функции:
                    textfield - текстовое поле ввода
                    event - событие
        
                    Метод определяет условие фильтрации хранилища в зависимости от текущего введенного значения, 
                    удаляет старый фильтр хранилища и добавляет новый, соответствующий новому условию фильтрации.
                */

                let filterForm = textfield.up('form');
                let grid = textfield.up('grid');
                let filters = grid.getStore().getFilters();
                let clearTextFilterButton = textfield.up().getComponent('clearTextFilterButton');

                if (textfield.value) {
                    function textFilterFunc(item) {
                        let val = textfield.value.toLowerCase();

                        for (const key in item.data) {
                            if (item.data[key] && typeof item.data[key] === 'string') {
                                if (filterForm.checkFields.includes(key) && item.data[key].toLowerCase().includes(val)) {
                                    return true;
                                }
                            } else if (item.data[key] && typeof item.data[key] === 'number') {
                                if (filterForm.checkFields.includes(key) && item.data[key].toString().includes(val)) {
                                    return true;
                                }
                            } else if (item.data[key] && typeof item.data[key] === 'object') {
                                let year = item.data[key].getFullYear() ? item.data[key].getFullYear() : 0;
                                let month = item.data[key].getMonth() ? item.data[key].getMonth() + 1 : 0;
                                let day = item.data[key].getDate() ? item.data[key].getDate() : 0;

                                let date = year.toString() + '-' + month.toString().padStart(2, '0') + '-' + day.toString().padStart(2, '0');

                                if (filterForm.checkFields.includes(key) && date.includes(val)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }

                    this.textFilter = filters.add(textFilterFunc);
                    clearTextFilterButton.enable();

                } else if (this.textFilter) {
                    filters.remove(this.textFilter);
                    this.textFilter = null;
                    clearTextFilterButton.disable();
                }
            },
            buffer: 500
        }
    }, {
        xtype: 'button',
        icon: '../resources/images/erase.png',
        tooltip: 'Очистить текстовый фильтр',
        itemId: 'clearTextFilterButton',
        disabled: true,
        width: 24,
        height: 25,
        listeners: {
            click: function (button) {
                //Функция для очистки активного текстового фильтра
                let filterField = button.up().down('textfield');

                filterField.setValue('');
                filterField.fireEvent('keyup', filterField);
            }
        },
    }],
});