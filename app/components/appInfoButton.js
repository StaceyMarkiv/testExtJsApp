//кнопка для создания информационного окна с описанием особенностей работы формы
Ext.define('app.components.appInfoButton', {
    extend: 'Ext.button.Button',
    xtype: 'form-info-button',
    width: 25,
    layout: 'center',
    text: '<b> ? </b>',
    tooltip: 'Информация',
    margin: '0 5 0 0',      //(top, right, bottom, left)
    infoWindowContent: '',      //расположение файла с описанием

    listeners: {
        click: function (infoButton) {
            const openInfoWindow = (url) => {
                //функция считывает файл описания и открывает инфо-окно с этим описанием
                const request = new XMLHttpRequest()
                request.open('GET', url)
                request.responseType = 'text'

                request.addEventListener('load', () => {
                    if (request.status == 200) {
                        const infoContent = request.responseText;

                        let formInfoWindow = Ext.create('Ext.window.Window', {
                            header: {
                                title: 'Информация',
                                titlePosition: 2,
                                items: [{
                                    xtype: 'button',
                                    icon: '../../resources/images/magnify.png',
                                    style: {
                                        borderRadius: '35% 65%',
                                    },
                                    handler: function (magnifyButton) {
                                        //увеличиваем шрифт текста описания
                                        let textEls = document.getElementsByClassName('description');
                                        let fontSize = magnifyButton.up('window').textFontSize;

                                        let newFontSize = (fontSize < 20) ? fontSize + 2 : fontSize;

                                        textEls[0].style['font-size'] = `${newFontSize}pt`;
                                        magnifyButton.up('window').textFontSize = newFontSize;
                                    }
                                }, {
                                    xtype: 'button',
                                    icon: '../../resources/images/minify.png',
                                    margin: '0 5 0 0',
                                    style: {
                                        borderRadius: '35% 65%',
                                    },
                                    handler: function (minifyButton) {
                                        //уменьшаем шрифт текста описания
                                        let textEls = document.getElementsByClassName('description');
                                        let fontSize = minifyButton.up('window').textFontSize;

                                        let newFontSize = (fontSize > 10) ? fontSize - 2 : fontSize;

                                        textEls[0].style['font-size'] = `${newFontSize}pt`;
                                        minifyButton.up('window').textFontSize = newFontSize;
                                    }
                                }]
                            },
                            maximizable: true,
                            scrollable: true,
                            width: 500,
                            height: 500,
                            padding: 10,
                            html: infoContent,
                            textFontSize: 10,

                            listeners: {
                                beforeshow: function () {
                                    if (infoButton.formInfoWindowOpened) {
                                        return false;
                                    }
                                },
                                close: function () {
                                    infoButton.formInfoWindowOpened = false;
                                },
                                show: function () {
                                    infoButton.formInfoWindowOpened = true;
                                },
                            }
                        });
                        formInfoWindow.show();
                    } else {
                        console.log(`${request.status}: ${request.statusText}`)
                    }
                })
                request.addEventListener('error', event => console.log('Что-то пошло не так'));
                request.send();
            }

            openInfoWindow(infoButton.infoWindowContent);
        }
    },
});
