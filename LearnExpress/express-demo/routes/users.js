var express = require('express');
var router = express.Router();
var userModel = require('../models/userModel.js');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/users/list');
});


/*用户列表*/
router.get('/list', function(req, res, next) {
	userModel.find(function(err, data) {
		if(err){
			return console.log(err);
		}
		res.render('UserList', {
			user: data
		})
	})
})
module.exports = router;
