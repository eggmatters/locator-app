/*
 * This file serves as a "routing table"
 * which will requests under document root of this site
 */
var express =  require('express'),
    router = express.Router();

//all routes follow here:

router.use('/locator', require('./locations'));

module.exports = router;