//picker для изменения имени пользователя

Ext.define("app.components.userPicker", {
    extend: "Ext.form.field.Picker",
    xtype: 'change-name-picker',
    editable: false,
    
    firstName: '',
    lastName: '',

    listeners: {
        expand: function (field) {
            let nameParts = field.value.split(' ');
            this.firstName = (nameParts[1]) ? nameParts[1] : '';
            this.lastName = (nameParts[0]) ? nameParts[0] : '';

            //заполняем форму редактирования значениями поля
            field.up('grid').down('form').down('#firstName').setValue(this.firstName);
            field.up('grid').down('form').down('#lastName').setValue(this.lastName);
        },
    },

    createPicker: function () {
        let me = this;

        return Ext.create('Ext.form.Panel', {
            padding: 5,
            floating: true,

            defaults: {
                listeners: {
                    specialkey: function (field, e) {
                        // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
                        // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
                        if (e.getKey() == e.ENTER) {
                            //записываем в ячейку таблицы измененное значение и сворачиваем picker
                            let form = field.up('form').getForm();
                            let newValues = form.getValues();

                            me.firstName = newValues['firstName'];
                            me.lastName = newValues['lastName'];

                            me.setValue(`${me.lastName} ${me.firstName}`);
                            me.collapse();
                            
                            let event = new Ext.event.Event({
                                keyCode: 13     //ENTER
                            });
                            me.fireEvent('specialkey', me, event);
                        } else if (e.getKey() == e.ESC) {
                            //просто сворачиваем picker, значение в ячейке таблицы не меняется
                            me.collapse();

                            let event = new Ext.event.Event({
                                keyCode: 27     //ESC
                            });
                            me.fireEvent('specialkey', me, event);
                        }
                    }
                }
            },

            items: [{
                xtype: 'textfield',
                itemId: 'firstName',
                fieldLabel: 'Имя',
                labelAlign: 'left',
                labelWidth: 60,
                anchor: '100%',
                name: 'firstName',
            }, {
                xtype: 'textfield',
                itemId: 'lastName',
                fieldLabel: 'Фамилия',
                labelAlign: 'left',
                labelWidth: 60,
                anchor: '100%',
                name: 'lastName',
            }],
        });
    }
});