var mongoose = ('mongoose');

mongoose.connect('mongodb://localhost/hrefs');


// Модель ссылки
var Href = mongoose.model('Href', { href: String, shref: String, ip: String, expire: Number, count: Number, created: Number });

// Дефолтное истекание жизни ссылки в милисекундах (час)
function getDefaultExpireDate() {
    return new Date().getTime() + 60 * 60 * 1000;
}

module.exports.getShrefId = function(callback) {
    Href.where({ created: { $gt: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) } }).count({}, function(err, count) {
        var now = new Date();
        return callback((now.getDate() < 10 ? "0" : "") + now.getDate().toString() + (now.getMonth() < 10 ? "0" : "") + now.getMonth().toString() + now.getFullYear().toString() + count.toString());
    });
}


module.exports.getValidCount = function(count) {
    return Number.isInteger(count) && count > 0 && count < 1001 ? count : null;
}

module.exports.getValidExpire = function(expire) {
    return Number.isInteger(expire) && expire > 0 && expire < 1001 ? expire * 60 * 60 * 1000 + new Date().getTime() : null;
}


module.exports.create = function(params, callback) {
    new Href({
        href: params.href,
        shref: params.shref,
        ip: params.ip,
        expire: params.expire || getDefaultExpireDate(),
        count: params.count || null,
        created: new Date().getTime()
    }).save(function(err, result) {
        return callback(err ? null : result.shref);
    });
}

module.exports.find = function(id, callback) {
    Href.findOne({ shref: id }, function(err, res) {
        if (err || !res) {
            return callback(null);
        }
        if (res.count === 0 || res.expire < new Date().getTime()) {
            res.remove();
            return callback(null);
        }
        if (Number.isInteger(res.count)) {
            res.count--;
            res.save();
        }
        return callback(res);
    });
}