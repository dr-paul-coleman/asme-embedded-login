/*
 * File: LoginDialog.js
 */

Ext.define('ASME.view.LoginRegistrationDialog', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.form.field.Text',
        'Ext.form.RadioGroup',
        'Ext.form.field.Radio',
        'Ext.button.Button'
    ],

    height: 200,
    id: 'asmeLoginRegistrationDlg',
    width: 375,
    resizable: false,
    layout: 'fit',
    title: 'ASME Sign In/Create Account',
    modal: true,

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: "panel",
                    layout: 'card',
                    id: 'wfLoginDlgCards',
                    border: 0,
                    items: [{
                        layout: 'absolute',
                        border: 0,
                        items: [{
                            xtype: 'textfield',
                            x: 35,
                            y: 35,
                            id: 'wfLoginDlgUsernameField',
                            itemId: 'wfLoginDlgUsernameField',
                            width: 300,
                            fieldLabel: 'User Name',
                            labelWidth: 105,
                            tabIndex: 2,
                            emptyText: 'e.g. user@asme.org'
                        },
                            {
                                xtype: 'textfield',
                                x: 35,
                                y: 65,
                                id: 'wfLoginDlgPwdField',
                                itemId: 'wfLoginDlgPwdField',
                                width: 300,
                                fieldLabel: 'Password',
                                labelWidth: 105,
                                inputType: 'password',
                                tabIndex: 3,
                                emptyText: 'Enter password',
                                enableKeyEvents: true,
                                listeners: {
                                    keyup: {
                                        fn: me.onLoginDlgPwdFieldKeyup,
                                        scope: me
                                    }
                                }
                            },
                            {
                                xtype: 'label',
                                id:"notAMemberLbl",
                                x: 35,
                                y: 135,
                                html: "Create and Account",
                                style: {
                                    'font-size': '10.2px',
                                    'text-decoration': 'none',
                                    color: '#5fa9ad'
                                },
                                listeners: {
                                    render: function(c){
                                        c.getEl().on('click', function(){
                                            Ext.getCmp('wfLoginDlgCards').layout.setActiveItem(1);
                                            Ext.getCmp('asmeLoginRegistrationDlg').setHeight(300);
                                            Ext.defer( function() {
                                                Ext.getCmp('wfLoginDlgFirstNameField').focus();
                                                }, 100
                                            );
                                        }, c);
                                    }
                                }
                            },
                            {
                                xtype: 'button',
                                x: 145,
                                y: 130,
                                width: 90,
                                tabIndex: 6,
                                text: 'Login',
                                listeners: {
                                    click: {
                                        fn: me.onLoginButtonClick,
                                        scope: me
                                    }
                                }
                            },
                            {
                                xtype: 'button',
                                x: 245,
                                y: 130,
                                width: 90,
                                tabIndex: 7,
                                text: 'Cancel',
                                listeners: {
                                    click: {
                                        fn: me.onCancelButtonClick,
                                        scope: me
                                    }
                                }
                            }]
                        },
                        {
                            layout: 'absolute',
                            border: 0,
                            items: [{
                                xtype: 'textfield',
                                x: 35,
                                y: 35,
                                id: 'wfLoginDlgFirstNameField',
                                itemId: 'wfLoginDlgFirstNameField',
                                width: 300,
                                fieldLabel: 'First Name',
                                labelWidth: 105,
                                tabIndex: 2,
                                emptyText: 'e.g. Johnette'
                            },{
                                xtype: 'textfield',
                                x: 35,
                                y: 65,
                                id: 'wfLoginDlgLastNameField',
                                itemId: 'wfLoginDlgLastNameField',
                                width: 300,
                                fieldLabel: 'Last Name',
                                labelWidth: 105,
                                tabIndex: 2,
                                emptyText: 'e.g. Jones'
                            },{
                                xtype: 'textfield',
                                x: 35,
                                y: 95,
                                id: 'wfLoginDlgEmailField',
                                itemId: 'wfLoginDlgEmailField',
                                width: 300,
                                fieldLabel: 'Email',
                                labelWidth: 105,
                                tabIndex: 2,
                                emptyText: 'e.g. user@asme.org'
                            },
                                {
                                    xtype: 'textfield',
                                    x: 35,
                                    y: 125,
                                    id: 'wfLoginDlgNewPwdField',
                                    itemId: 'wfLoginDlgNewPwdField',
                                    width: 300,
                                    fieldLabel: 'Password',
                                    labelWidth: 105,
                                    inputType: 'password',
                                    tabIndex: 3,
                                    emptyText: 'Set a password',
                                    enableKeyEvents: true,
                                    listeners: {
                                        keyup: {
                                            fn: me.onLoginDlgPwdFieldKeyup,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    x: 35,
                                    y: 155,
                                    id: 'wfLoginDlgRePwdField',
                                    itemId: 'wfLoginDlgRePwdField',
                                    width: 300,
                                    fieldLabel: 'Confirm Password',
                                    labelWidth: 105,
                                    inputType: 'password',
                                    tabIndex: 3,
                                    emptyText: 'Re-enter password',
                                    enableKeyEvents: true,
                                    listeners: {
                                        keyup: {
                                            fn: me.onLoginDlgPwdFieldKeyup,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    x: 145,
                                    y: 200,
                                    width: 90,
                                    tabIndex: 6,
                                    text: 'Register',
                                    listeners: {
                                        click: {
                                            fn: me.onRegisterButtonClick,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    x: 245,
                                    y: 200,
                                    width: 90,
                                    tabIndex: 7,
                                    text: 'Cancel',
                                    listeners: {
                                        click: {
                                            fn: me.onCancelRegistrationButtonClick,
                                            scope: me
                                        }
                                    }
                                }]
                        },
                        {
                            xtype: 'uxiframe',
                            id: 'salesforceFrontDoorIFrame'
                        }]
            }],
            listeners: {
                show: {
                    fn: me.onLoginDlgShow,
                    scope: me
                }
            }
        });

        me.callParent(arguments);
    },

    onLoginDlgPwdFieldKeyup: function(textfield, e, eOpts) {
        e.stopEvent();
        if ( e.getKey() === e.RETURN ) {
            if ( !Ext.isEmpty( textfield.getValue() ) && !Ext.isEmpty(textfield.up().queryById('wfLoginDlgUsernameField').getValue()) ) {
                Ext.getCmp('asmeLoginRegistrationDlg').onLoginButtonClick();
            }
        }
    },

    onLoginDlgShow: function(component, eOpts) {
        const me = component;
        Ext.defer( function() {
            me.queryById('wfLoginDlgUsernameField').focus();
        },100);
    },

    onRegisterButtonClick: function(button, e, eOpts) {

    },

    onLoginButtonClick: function(button, e, eOpts) {
        Ext.defer( function() {
            const me = Ext.getCmp('asmeLoginRegistrationDlg');
            const username = me.queryById('wfLoginDlgUsernameField').getValue();
            const passwd = me.queryById('wfLoginDlgPwdField').getValue();
            if( !Ext.isEmpty(username) && !Ext.isEmpty(passwd) ) {

                me.setLoading('Revving up...');

                try {
                    $.ajax({
                        url: "/login",
                        type: "POST",
                        data: "username=" + username + '&password=' + passwd,
                        dataType: "text",
                        success: function(res, status, http) {
                            if (res) {
                                for (let key in res.cookie) {
                                    if (res.cookie.hasOwnProperty(key)) {
                                        document.cookie = key + '=' + res.cookie[key];
                                    }
                                }
                                location = res.frontdoor;
                            }
                        }
                    });
                }catch(e){
                    me.setLoading(false);
                }

            } else {

                Ext.Msg.show({
                    title:'Credentials Missing',
                    msg: (Ext.isEmpty(username)?'Please enter a username.': 'Please enter a password.'),
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.ERROR
                });
            }
        },100);
    },

    onCancelRegistrationButtonClick: function(button, e, eOpts) {
        Ext.getCmp('wfLoginDlgCards').layout.setActiveItem(0);
        Ext.getCmp('asmeLoginRegistrationDlg').setHeight(200);
        Ext.defer( function() {
                Ext.getCmp('wfLoginDlgUsernameField').focus();
            }, 100
        );

    },

    onCancelButtonClick: function(button, e, eOpts) {
        const dlg = Ext.getCmp("asmeLoginRegistrationDlg");
        dlg.hide();
        dlg.close();
        Ext.destroy(dlg);
    }

});