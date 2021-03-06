
var dbLists = require("./mongo.js");

var dockerDB = dbLists.docker;

var adminDB = dbLists.admin;

var mongo = function(db){
  this.db = db;
};

mongo.prototype.save = function(data, callback){
  var self = this;
  var instence = new self.db();
  for(var i in data){
      instence[i] = data[i];
  }

  instence.save(function(err, data){
          if(err){
              console.log(err)
              // return err;
          }else {
            // console.log(data)
            callback;
          }
   });
};

mongo.prototype.create = function(req, res) {
  var self = this;
  self.db.create({}, function(err, db) {
    if(err) { return handleError(res, err); }
    return res.json(db);
  });
};

mongo.prototype.find = function(data, callback) {
  var self = this;

  self.db.findOne(data, function(err, db){
        if(err) return ({error: 'database failure'});
        if(typeof callback === "function") {
          return  callback(db);
        }else {
          return  (db);
        }
    });
    // return res.json(db);
  // });
};

mongo.prototype.show = function(callback) {
  var self = this;

  self.db.find(function(err, db){
        if(err) {
            return ({error: 'database failure'});
        }
        if(typeof callback === "function") {
          callback(db);
        }else {
          // console.log("db");
          return  (db);
        }
    });

};


mongo.prototype.destroy = function(callback) {
  var self = this;
    self.db.remove({}, function(err) {
            if (err) {
                // callback(err);
            } else {
                // callback('success');
            }
        }
    );
};

mongo.prototype.count = function(callback) {
  var self = this;
  self.db.count({}, function(err, count) {
      if(err) return ({error: 'database failure'});
      if(typeof callback === "function") {
        return  callback(count);
      }else {
        return  (count);
      }
  });
};

mongo.prototype.update = function(filter,data, attr,callback) {

  var self = this;
  if(arguments.length === 3){
    callback = attr;
    attr = null;
  }

  self.db.findOne(filter, function(err, db){
        if(err) return ({error: 'database failure'});

        for(var i in data){
          // if(data.hasO)
            if(attr === null){
              if(data.hasOwnProperty(i)){
                db[i] = data[i];
              }
            }else {
              if(data.hasOwnProperty(i) && db[attr].hasOwnProperty(i)){
                db[attr][i] = data[i];
              }
            }
        }
        // console.log(db);
        db.save(function(err, db){

          if(err) {
              callback(err);
          }else {
            callback(true);
          }
        });
    });
}



//     });
// }

var docker = new mongo(dockerDB);
var admin = new mongo(adminDB);

var lists = {
   "docker" : docker,
   "admin" : admin
};

module.exports = lists;
