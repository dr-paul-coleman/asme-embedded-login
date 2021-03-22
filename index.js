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
const app = express();
const cookieParser = require('cookie-parser');
const request = require('request-promise');
const jsforce = require('jsforce');
const bodyParser = require('body-parser');
const cors = require('cors');

//App vars
var refreshToken = "";
var accessToken = "";
var sessionContact = "";

//Set up App
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(__dirname + '/public'));
//app.use(express.json());
//app.use(express.urlencoded());
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
    var contactRecords = [];
    var bookingRecords = [];
    var searchRecords = [];
    var wishes = [];

    //Grab Contact
    conn.query("SELECT Id, FirstName, LastName, Phone, Email FROM Contact WHERE Id = '" + sessionContact + "'", function(err, result) {
        if (err) { return console.error(err); }
        console.log("Profile Render: Contact result size is " + result.totalSize);
        console.log("Profile Render: Number of contacts found is " + result.records.length);

        contactRecords = result.records;
        console.log("Profile Render: Contact retrieved " + JSON.stringify(contactRecords));
        console.log("Profile Render: Contact has external ID of " + contactRecords[0].customerID__c);

        //Grab Wishlist
        // conn.query("SELECT Contact__c,CreatedDate,Id,Wish_Detail__c FROM Wish__c WHERE Contact__c = '" + sessionContact + "'", function(err, result) {
        //     if (err) { return console.error(err); }
        //     console.log("Profile Render: Wishlist result size is " + result.totalSize);
        //     console.log("Profile Render: Number of wishes found is " + result.records.length);
        //
        //     wishes = result.records;
        //     console.log("Profile Render: wishes retrieved " + JSON.stringify(wishes));
        //
        //     //Grab Searches
        //     conn.query("SELECT Contact__c,CreatedDate,Id,Location__c FROM Searches__c WHERE Contact__c = '" + sessionContact + "'", function(err, result) {
        //         if (err) { return console.error(err); }
        //         console.log("Profile Render: Search result size is " + result.totalSize);
        //         console.log("Profile Render: Number of searches found is " + result.records.length);
        //
        //         searchRecords = result.records;
        //         console.log("Profile Render: Searches retrieved " + JSON.stringify(searchRecords));
        //
        //         //Grab Bookings
        //         conn.query("SELECT DisplayUrl, ExternalId, numTickets__c, tourDate__c, tourId__c, tourType__c FROM bookings__x WHERE customerId__c = '" + contactRecords[0].customerID__c + "' LIMIT 50", function(err, result) {
        //             if (err) { return console.error(err); }
        //             console.log("Profile Render: Bookings result size is " + result.totalSize);
        //             console.log("Profile Render: Number of bookings found is " + result.records.length);
        //
        //             bookingRecords = result.records;
        //             console.log("Profile Render: Bookings retrieved " + JSON.stringify(bookingRecords));


                    //Render the page once records are fetched
                    res.render('profile', {
                        community_url: COMMUNITY_URL,
                        app_id: APP_ID,
                        callback_url: OAUTH_CALLBACK_URL,
                        background: BG_FAKE,
                        static_asset_url: STATIC_ASSET_URL,
                        contactRecords: contactRecords,
                        bookingRecords: bookingRecords,
                        searchRecords: searchRecords,
                        wishes: wishes
                    }) 
        
            //     });
            //
            // });
    
        //});

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
        
        var idToken = responseJSON.id_token;
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

app.post('/login', function(req, res){
    
    console.log("Login AJAX: Body Parser payload is..." + JSON.stringify(req.body));
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {

        const body = {
            "grant_type": "password",
            "client_id": APP_ID,
            "client_secret": APP_SECRET,
            "redirect_uri": OAUTH_CALLBACK_URL,
            "username": username,
            "password": password
        }


        //Set up Callback
        const options = {
            method: 'POST',
            uri: COMMUNITY_URL + '/services/oauth2/token',
            form: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        request(options).then(function (response) {

            console.log("Login AJAX: Retrieved the access token successfully.");

            //Parse response
            responseJSON = JSON.parse(response);

            console.log("Login AJAX: OAuth Payload is..." + JSON.stringify(responseJSON));

            //Update refresh token
            accessToken = responseJSON.access_token;

            console.log("Login AJAX: Requesting the identity data...");

            //Set up Callback
            const options = {
                method: 'GET',
                uri: responseJSON.id + '?version=latest',
                body: body,
                json: true,
                followAllRedirects: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken
                }
            }

            request(options).then(function (response) {

                const JSONidentityResponse = JSON.parse(response);
                console.log("Login AJAX: Retrieved identity data successfully..." + response);

                JSONidentityResponse.access_token = accessToken;
                const identity_response = Buffer.from(response).toString("base64");
                const frontdoor = COMMUNITY_URL + '/secur/frontdoor.jsp?sid=' + accessToken + '&retURL=/asmehome';
                const cookie = 'auth_token=' + accessToken + '&identity_response=' + identity_response;

                res.json = {'frontdoor': frontdoor, 'cookie': cookie}

                // const oneHourSeconds = 60 * 60;
                // res.cookie('auth_token', accessToken,
                //     { maxAge: oneHourSeconds,
                //         httpOnly: false,
                //         secure: false
                //     });
                //
                // res.cookie('identity_response', identity_response,
                //     { maxAge: oneHourSeconds,
                //         httpOnly: false,
                //         secure: false
                //     });

                //console.log("Login AJAX: Redirecting to community frontdoor.");
                //res.redirect(COMMUNITY_URL + '/secur/frontdoor.jsp?sid='+ accessToken + '&retURL=/asmehome');

            }).catch(function (err) {
                console.log(err);
            })

        }).catch(function (err) {
            console.log(err);
        })
    }
});

//Run
app.listen(PORT, function () {
  console.log('We\'re live on the magic listening action of port ' + PORT + '!');
});