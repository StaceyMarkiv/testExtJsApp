Ext.define('app.store.mainPageStore', {
    extend: 'Ext.data.JsonStore',
    model: 'app.model.mainPageModel',
    proxy: {
        type: 'ajax',
        url : 'app/php/get_data.php',
        reader: {
            type: 'json',
        }
    },
});