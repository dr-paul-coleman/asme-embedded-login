const PORT = process.env.PORT || 5000;
const COMMUNITY_URL = process.env.COMMUNITY_URL;
const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const OAUTH_CALLBACK_URL = process.env.OAUTH_CALLBACK_URL;
const HOSTED_APP_URL = process.env.HOSTED_APP_URL;
const BG_FAKE = process.env.BG_FAKE;
const STATIC_ASSET_URL = process.env.STATIC_ASSET_URL;

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const request = require('request-promise');
const jsforce = require('jsforce');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const cp = require("child_process");

const app = express();

//App vars
var refreshToken = "";
var accessToken = "";
var sessionContact = "";

//Set up App
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

//Routes
app.get('/', function(req, res){ 

    res.render('index', {
        community_url: COMMUNITY_URL,
        app_id: APP_ID,
        callback_url: OAUTH_CALLBACK_URL,
        background: BG_FAKE,
        static_asset_url: STATIC_ASSET_URL
    }) 
}); 

app.get('/profile', function(req, res){ 

    // Check loken
    console.log("Profile Render: Double-checking access is valid. Session equals " + accessToken)

    // Redirect if the access token is missing
    if(accessToken == null || accessToken == "") {
        res.redirect('/');
    }

    //Proceed with it then
    var conn = new jsforce.Connection({
        instanceUrl : COMMUNITY_URL,
        accessToken : accessToken
    });

    console.log("Profile Render: Fetching profile information...")

    //Grab Contact
    let contactRecords = [];
    conn.identity(function (err, res) {
        if (err) {
            console.error(err);
        } else {
            console.log("Profile Render: User identity..." + JSON.stringify(res));

            conn.query("SELECT Id, FirstName, LastName, Phone, Email FROM Contact WHERE Id IN (SELECT ContactId FROM User WHERE Id = '"+res.user_id+"') LIMIT 1", function (err, result) {
                if (err) {
                    return console.error(err);
                }
                console.log("Profile Render: Contact result size is " + result.totalSize);
                console.log("Profile Render: Number of contacts found is " + result.records.length);

                contactRecords = result.records;
                console.log("Profile Render: Contact retrieved " + JSON.stringify(contactRecords));
                console.log("Profile Render: Contact has external ID of " + contactRecords[0].customerID__c);

                //Render the page once records are fetched
                res.render('profile', {
                    community_url: COMMUNITY_URL,
                    app_id: APP_ID,
                    callback_url: OAUTH_CALLBACK_URL,
                    background: BG_FAKE,
                    static_asset_url: STATIC_ASSET_URL,
                    contactRecords: contactRecords,
                    bookingRecords: [],
                    searchRecords: [],
                    wishes: []
                })
            });
        } //else identity query res
    });
});

app.get('/_callback', function(req, res){ 

    res.render('callback', {
        community_url: COMMUNITY_URL,
        app_id: APP_ID,
        callback_url: OAUTH_CALLBACK_URL,
        hosted_app_url: HOSTED_APP_URL,
        static_asset_url: STATIC_ASSET_URL
    }) 
}); 

app.get('/server_callback', function(req, res){ 

    console.log("Server Callback query: "+ JSON.stringify(req.query));
    console.log("Server Callback: Requesting the access token...");

    //Parse query string

    var code = req.query.code;
    if (req.query.code != null) {
        code = decodeURI(code);
    } else {
        //If there is no auth code, such as after registration, 
        //then redirect back to main page and let them log in
        res.redirect('/');
    }

    var startURL = req.query.state;
    if (req.query.state != null) {
        startURL = decodeURI(startURL);
    }

    // Do OAuth auth code exchange from callback flow
    // Set up request body
    const body = {
        "code": code,
        "grant_type": "authorization_code",
        "client_id": APP_ID,
        "client_secret": APP_SECRET,
        "redirect_uri": OAUTH_CALLBACK_URL
    }
    
    // Set up Callback
    const options = {
        method: 'POST',
        uri: COMMUNITY_URL + '/services/oauth2/token',
        form: body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    request(options).then(function (response){

        console.log("Server Callback: Retrieved the access token successfully.");

        //Parse response
        responseJSON = JSON.parse(response);

        console.log("Server Callback: Payload is..." + JSON.stringify(responseJSON));
        var identity = responseJSON.id;

        //Update refresh token
        accessToken = responseJSON.access_token;
        refreshToken = responseJSON.refresh_token;

        console.log("Server Callback: Requesting the identity data...");
        
        //Set up Callback
        const options = {
            method: 'GET',
            uri: identity + '?version=latest',
            body: body,
            json: true,
            followAllRedirects: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        }

        request(options).then(function (response){
            
            console.log("Server Callback: Retrieved identity data successfully.");
            console.log("Server Callback: Creating redirect page.");

            var JSONidentityResponse = JSON.stringify(response);
            JSONidentityResponse.access_token = accessToken;
            const oneHourSeconds = 60 * 60;
            res.cookie('auth_token', accessToken,
                { maxAge: oneHourSeconds,
                    httpOnly: false,
                    secure: false
                    //secure: process.env.NODE_ENV === 'production'? true: false
                });

            console.log("Server Callback Identity Response: " + JSONidentityResponse);
            sessionContact = response.custom_attributes.ContactID;
            res.render('server_callback', {
                community_url: COMMUNITY_URL,
                app_id: APP_ID,
                callback_url: OAUTH_CALLBACK_URL,
                start_url: startURL,
                hosted_app_url: HOSTED_APP_URL,
                static_asset_url: STATIC_ASSET_URL,
                identity_response: Buffer.from(JSONidentityResponse).toString("base64")
            }) 

        })

        .catch(function (err) {
            console.log(err);
        })

    })
    .catch(function (err) {
        console.log(err);
    })

}); 


app.get('/logout', function(req, res){ 

    //Clear persisted tokens
    accessToken = "";
    refreshToken = "";
    sessionContact = "";

    res.clearCookie('auth_token');
    res.render('logout', {
        community_url: COMMUNITY_URL,
        app_id: APP_ID,
        callback_url: OAUTH_CALLBACK_URL,
        background: BG_FAKE,
        static_asset_url: STATIC_ASSET_URL
    }) 

});

app.post('/login', function(req, resp){
    resp.setHeader('Content-Type', 'application/json');
    console.log("Login AJAX: Body Parser payload is..." + JSON.stringify(req.body));
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        doJWTLogin( username, password, req, resp )
    }
});

const doJWTLogin = function(username, password, req, resp) {
    //simplifying login access for a reusable pattern (a service account could be passed for User Provisioning)
    cp.exec("sfdx force:auth:jwt:grant -i $JWT_CLIENT_ID -f jwt.key -r $JWT_ORG_URL -s -a asme -u " + username, (err, stdout) => {
        console.log(stdout);
        if (stdout.startsWith("Successfully authorized")) {
            cp.exec("sfdx force:org:display -u asme --json | ~/vendor/sfdx/jq/jq -r '.result'", (err, org) => {
                if (err) {
                    console.log(err);
                    resp.end(JSON.stringify({'frontdoor': null, 'cookie': null, 'identity': null}) );

                } else {
                    const {accessToken, instanceUrl} = JSON.parse(org);
                    if (accessToken && accessToken.startsWith('00D5w000003yStQ')) { //asme demo org

                        let response = {};
                        response.frontdoor = COMMUNITY_URL + '/secur/frontdoor.jsp?sid=' + accessToken + '&retURL=/asmehome';
                        response.cookie = 'auth_token=' + accessToken + '&instance_url=' + instanceUrl;

                        console.log("JWT Login: Fetching profile information...")
                        const $jsf = new jsforce.Connection({
                            'instanceUrl': instanceUrl,
                            'accessToken': accessToken
                        });

                        $jsf.identity(function (err, res) {
                            if (err) {
                                console.error(err);
                            } else {
                                response.identity = res;
                            }
                            resp.end(JSON.stringify(response) );
                        });

                    }
                }
            });
        }
    });
}

//Run
app.listen(PORT, function () {
    console.log('>>>>>>>>>>>>  Listening on port ' + PORT);

    fs.writeFile('jwt.key', process.env.JWT_CERT, function (err) {
        if (err) return console.log(err);
        console.log('jwt cert saved.')
    });
});

