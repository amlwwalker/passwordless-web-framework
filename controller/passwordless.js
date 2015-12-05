'use strict'

var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var config = require('../config');
var User = require('../models/user');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.mandrill.api_key);

var emailText = function(html, token, uid) {
	var email;
	var linkA = function(url) { return (html) ? ('<a href="' + url + '">' + url + '</a>') : url; }		
	
	if (html) {
		email = "<h3>Hi</h3>, someone using this email requested a login token for the framework.<br/>You can access it by going to this link: " + linkA(config.http.host_url + '/?token=' + encodeURIComponent(token) 
					+ '&uid=' + encodeURIComponent(uid)) + " See you there!"
	} else {
		email = "Hi, someone using this email requested a login token for the framework.\r\nYou can access it by going to this link: " + linkA(config.http.host_url + '/?token=' + encodeURIComponent(token) 
					+ '&uid=' + encodeURIComponent(uid)) + " See you there!"
	}
	return email
};			

module.exports = function(app) {

	passwordless.init(new MongoStore(config.mongodb.uri,  {
				server: { auto_reconnect: true },
			    mongostore: { collection: 'tokens' }}));

	passwordless.addDelivery(
		function(tokenToSend, uidToSend, recipient, callback) {

			var message = {
			    "html": emailText(true, tokenToSend, uidToSend),
			    "text": emailText(false, tokenToSend, uidToSend),
			    "subject": config.mandrill.subject,
			    "from_email": config.mandrill.from,
			    "from_name": config.mandrill.fromname,
			    "to": [{
			            "email": recipient,
			            "name": "",
			            "type": "to"
			        }],
			    "headers": {
			        "Reply-To": config.mandrill.from
			    },
			};

			mandrill_client.messages.send({"message": message, "async": false, "ip_pool": null, "send_at": null}, 
				function(result) {
    				// success
    				callback();
				}, function(e) {
					var err = 'An email delivery error occurred: ' + e.name + ' - ' + e.message;
				    console.log(err);
				    callback(err);
				});
		});

	app.use(passwordless.sessionSupport());
	app.use(passwordless.acceptToken( {	successFlash: 'You are logged in. Welcome to Passwordless!', 
										failureFlash: 'The supplied token is not valid (anymore). You will need to request another one.',
										successRedirect: '/success' } ));

	// For every request: provide user data to the view
	app.use(function(req, res, next) {
		if(req.user) {
			User.findById(req.user, function(error, userdoc) {
				res.locals.user = userdoc;
				next();
			});
		} else {
			next();
		}
	})
}
