/*
 * File: LoginDialog.js
 */

Ext.define('WF.view.LoginDialog', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.form.field.Text',
        'Ext.form.RadioGroup',
        'Ext.form.field.Radio',
        'Ext.button.Button'
    ],

    height: 206,
    id: 'wfLoginDlg',
    width: 375,
    resizable: false,
    layout: 'absolute',
    title: 'ASME Login',
    modal: true,

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'textfield',
                    x: 35,
                    y: 35,
                    id: 'wfLoginDlgUsernameField',
                    itemId: 'wfLoginDlgUsernameField',
                    width: 300,
                    fieldLabel: 'User Name',
                    labelWidth: 75,
                    tabIndex: 2,
                    emptyText: 'Enter user@domain.com...'
                },
                {
                    xtype: 'textfield',
                    x: 35,
                    y: 65,
                    id: 'wfLoginDlgPwdField',
                    itemId: 'wfLoginDlgPwdField',
                    width: 300,
                    fieldLabel: 'Password',
                    labelWidth: 75,
                    inputType: 'password',
                    tabIndex: 3,
                    emptyText: 'Enter password...',
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
                    x: 140,
                    y: 130,
                    width: 100,
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
                    x: 250,
                    y: 130,
                    width: 100,
                    tabIndex: 7,
                    text: 'Cancel',
                    listeners: {
                        click: {
                            fn: me.onCancelButtonClick,
                            scope: me
                        }
                    }
                }
            ],
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
                textfield.up().onLoginButtonClick();
            }
        }
    },

    onLoginDlgShow: function(component, eOpts) {
        var me = component;
        if( $user && $user.Username ) {
            Ext.defer( function() {
                var username = $user.Username.split('@');
                var domain = username[1].split(".");
                username = domain.length>1? (username[0].replace('.','') +"@" + domain[0] + "." + domain[1]) : $user.Username;
                me.queryById('wfLoginDlgUsernameField').setValue(username);
                if (Ext.isEmpty(me.queryById('wfLoginDlgOrgLabel').getValue()) ) {
                    me.queryById('wfLoginDlgOrgLabel').focus();
                } else {
                    me.queryById('wfLoginDlgPwdField').focus();
                }
            },100);
        } else {
            Ext.defer( function() {
                if (Ext.isEmpty(me.queryById('wfLoginDlgOrgLabel').getValue()) ) {
                    me.queryById('wfLoginDlgOrgLabel').focus();
                } else {
                    me.queryById('wfLoginDlgPwdField').focus();
                }
            },100);

        }
    },

    onLoginButtonClick: function(button, e, eOpts) {
        if ( sforce.rest ) {

            Ext.defer( function() {
                var me = Ext.getCmp('wfLoginDlg');
                var username = me.queryById('wfLoginDlgUsernameField').getValue();
                var pwd = me.queryById('wfLoginDlgPwdField').getValue();
                var label = me.queryById('wfLoginDlgOrgLabel').getValue();
                if( !Ext.isEmpty(username) && !Ext.isEmpty(pwd) && !Ext.isEmpty(label) ) {

                    me.setLoading('Please wait...');

                    var loginUrl = me.queryById('wfLoginDlgProdOrgRadio').checked? "https://login.salesforce.com": "https://test.salesforce.com";
                    try {
                        $rest.login( username, pwd, loginUrl, function(result,request) {
                            var me = Ext.getCmp('wfLoginDlg');
                            try {

                                if (!result.loginFault) {
                                    console.log("Good to Go");
                                    var label = me.queryById('wfLoginDlgOrgLabel').getValue();
                                    var resultObj = {};
                                    resultObj[label] = result;
                                    if (typeof me.callback === "function") {
                                        me.callback(resultObj);
                                    }
                                    me.hide();
                                    me.close();
                                } else {
                                    Ext.Msg.show({
                                        title:(result.loginFaultCode?result.loginFaultCode:"Login Failed"),
                                        msg: (result.loginFault?result.loginFault:"") + '<br/><br/>Check Javascript Console for more errors.',
                                        buttons: Ext.Msg.OK,
                                        icon: Ext.Msg.ERROR
                                    });
                                }
                            } finally {
                                me.setLoading(false);
                            }
                        });
                    }catch(e){
                        me.setLoading(false);
                    }

                } else {

                    if (Ext.isEmpty(label)) {
                        Ext.Msg.show({
                            title:'Org Label Required',
                            msg: 'Please provide a unique label for this set of org login credentials.',
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.ERROR
                        });
                    } else {

                       Ext.Msg.show({
                            title:'Credentials Missing',
                            msg: (Ext.isEmpty(username)?'Please enter a username.': 'Please enter a password.'),
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.ERROR
                        });
                    }
                }
            },100);

        } else {
            Ext.Msg.show({
                title:'Cannot Login',
                msg: 'The Salesforce Rest API Javscript Library is not loaded properly.',
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR
            });
        }
    },

    onCancelButtonClick: function(button, e, eOpts) {
        button.up().hide();
        button.up().close();
    }

});