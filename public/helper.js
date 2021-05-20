function onLogin(identity) {
    //responseJSON = JSON.parse(identity);
    //console.log("Identity = " + JSON.stringify(SFIDWidget.openid_response));
    //console.log("Access Token = " + SFIDWidget.openid_response.access_token);
		
    // var targetDiv = document.querySelector(SFIDWidget.config.target);
    //
    // var avatar = document.createElement('a');
    // avatar.href = "javascript:showIdentityOverlay();";
    //
    // var username = document.createElement('a');
    //
    // /* If using client-side auth
    // username.href = "https://.herokuapp.com/profile?accesstoken=" + SFIDWidget.openid_response.access_token + "&id=" + SFIDWidget.openid_response.custom_attributes.ContactID;
    // */
    //
    // username.href = "/profile";
    //
    // username.innerHTML = identity.username;
    // username.className = "sfid-avatar-name";
    //
    // var img = document.createElement('img');
    // img.src = identity.photos.thumbnail;
    // img.className = "sfid-avatar";
    //
    // var iddiv = document.createElement('div');
    // iddiv.id = "sfid-identity";
    //
    // avatar.appendChild(username);
    // avatar.appendChild(img);
    // iddiv.appendChild(avatar);
    //
    // targetDiv.innerHTML = '';
    // targetDiv.appendChild(iddiv);
}

function onLogout() {
    if( typeof SFIDWidget !== 'undefined' ) SFIDWidget.init();
    console.log("Attempted to expire token and init. Redirecting...");
    window.location= "https://sdodemo-main-166ce2cf6b6-16b-179814ac144.force.com/secur/logout.jsp?retUrl=https%3A%2F%2Fsdodemo-main-166ce2cf6b6-16b-179814ac144.force.com%2Findex";
}