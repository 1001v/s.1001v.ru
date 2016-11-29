var express = require('express');
var href = require('../href.js');
var url = require('url');
var router = express.Router();


router.post('/generate', function(req, res, next) {
    if (req.body.href) {
        href.getShrefId(function(id) {
            href.create({
                href: req.body.href,
                shref: id + (req.body.secret || ""),
                ip: req.ip,
                count: href.getValidCount(req.body.count),
                expire: href.getValidExpire(req.body.expire)
            }, function(created) {
                return res.json({ created: created });
            });
        });
    } else
        return next();
});

router.get('/:href', function(req, res, next) {
    href.find(req.params.href, function(result) {
        if (result) {
            if (result.href.indexOf("http") === -1) {
                result.href = 'http://' + result.href;
            }
            res.redirect(result.href);
        } else
            next();
    });
});

module.exports = router;