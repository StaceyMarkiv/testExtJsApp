Ext.application({
    name: 'app',
    views: [
        'mainPageView',
    ],
    requires: [
        'app.view.mainPageController'
    ],
    launch: function () {
        Ext.create('Ext.container.Viewport', {
            layout: {
                type: 'border',
                pack: 'start',
                align: 'stretch'
            },
            items: [{
                xtype: 'mainPageView',
                region: 'north',
                height: '100%'
            }]
        });
    },
});
