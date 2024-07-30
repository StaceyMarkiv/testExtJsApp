Ext.define('app.store.cityFormStore', {
    extend: 'Ext.data.JsonStore',
    model: 'app.model.cityFormModel',
    proxy: {
        type: 'ajax',
        url : 'app/php/get_city_data.php',
        reader: {
            type: 'json',
        }
    },
});