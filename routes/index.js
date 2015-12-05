var express = require('express');
var router = express.Router();
var passwordless = require('passwordless');
/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { validation: req.flash('validation')[0], 
		error: req.flash('passwordless')[0], success: req.flash('passwordless-success')[0], homepage: true });
});

/* GET logged in. */
router.get('/success', passwordless.restricted({ failureRedirect: '/' }), function(req, res) {
	res.render('success', { validation: req.flash('validation')[0], 
		error: req.flash('passwordless')[0], success: req.flash('passwordless-success')[0] });
});


/* GET get started. */
router.get('/getstarted', function(req, res) {
	res.render('getstarted');
});

/* GET deep dive. */
router.get('/explanation', function(req, res) {
	res.render('explanation');
});

/* GET plugins. */
router.get('/templates', function(req, res) {
	res.render('templates');
});

/* GET deep dive. */
router.get('/about', function(req, res) {
	res.render('about');
});

module.exports = router;
