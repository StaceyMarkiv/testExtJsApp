//кнопка "Выбрать все / Убрать все" для меню фильтров

Ext.define("app.components.selectAllButton", {
    extend: "Ext.button.Segmented",
    xtype: 'select-all-button',

    padding: '5 0 5 5',

    items: [{
        text: 'Выбрать все',
        itemId: 'selectAll'
    }, {
        text: 'Убрать все',
        itemId: 'deselectAll'
    }],

    listeners: {
        toggle: function (container, button, pressed) {
            if (button.itemId === 'selectAll') {
                let checkboxgroup = container.up().down('checkboxgroup');
                checkboxgroup.eachBox(function (el) {
                    el.setValue(true);
                });
            } else if (button.itemId === 'deselectAll') {
                let checkboxgroup = container.up().down('checkboxgroup');
                checkboxgroup.eachBox(function (el) {
                    el.setValue(false);
                });
            }
        }
    }
});