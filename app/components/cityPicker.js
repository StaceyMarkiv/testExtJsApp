//picker для изменения городов пользователя

Ext.define("app.components.cityPicker", {
    extend: "Ext.form.field.Picker",
    xtype: 'select-city-picker',
    editable: false,

    checkedCityIds: [],
    expanded: false,

    listeners: {
        expand: function (field) {
            //заполняем форму редактирования значениями поля

            let topParent = (field.up('grid')) ? field.up('grid') : field.up('window');

            let selectionPanel = topParent.down('#cityPickerForm').down('#citySelection');
            selectionPanel.removeAll();

            let cityStore = field.lookupController().cityStore;
            cityStore.sort((x, y) => {
                return (x[1] > y[1]) ? 1 : (x[1] < y[1]) ? -1 : 0;
            });

            let fieldValues = field.value.split(', ');

            for (const el of cityStore) {
                let checkboxEl = {
                    boxLabel: el[1],
                    name: 'city',
                    inputValue: parseInt(el[0]),
                };

                if (fieldValues.includes(el[1])) {
                    checkboxEl.checked = true;
                }

                selectionPanel.add(checkboxEl);
            }

            this.expanded = true;
        },
        
        specialkey: function (field, e) {
            if (e.getKey() == e.ENTER) {
                if (this.expanded) {
                    this.collapse();
                    this.expanded = false;
                }
            }
        }
    },

    createPicker: function () {
        let me = this;

        return Ext.create('Ext.form.Panel', {
            itemId: 'cityPickerForm',
            padding: 5,
            floating: true,
            maxHeight: 250,
            scrollable: true,

            items: [{
                xtype: 'checkboxgroup',
                itemId: 'citySelection',
                hideEmptyLabel: true,
                columns: 1,
                items: [],

                listeners: {
                    change: function (checkboxgroup, newValue) {
                        me.checkedCityIds = me.lookupController().checkedCityIds = newValue['city'];

                        let newFieldValue = '';
                        for (const el of checkboxgroup.getChecked()) {
                            newFieldValue += el.boxLabel + ', ';
                        }
                        newFieldValue = newFieldValue.slice(0, newFieldValue.length - 2);

                        me.setValue(newFieldValue);
                        me.focus();
                    },
                }
            }],
        });
    }
});