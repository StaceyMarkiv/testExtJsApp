Ext.define('app.model.mainPageModel', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id_user', type: 'int' },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'birthday', type: 'date' },
        { name: 'grade', type: 'string' },
        { name: 'city', type: 'string' },
        {
            name: 'user',
            convert: function (val, record) {
                return record.get('last_name') + ' ' + record.get('first_name');
            }
        },
        { name: 'has_car', type: 'bool', },
    ]
});