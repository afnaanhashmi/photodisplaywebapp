/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

var express = require('express');
var app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
var path = require('path');
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var Activity = require('./schema/activity.js');
var SchemaInfo = require('./schema/schemaInfo.js');
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');


// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
//var cs142models = require('./modelData/photoApp.js').cs142models;
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send(path.join('Simple web server of files from ', __dirname));
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    //('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
        User.find({}, function (err, info) {
            if (err) {
                console.error('Doing /user/list error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                response.status(500).send('Missing SchemaInfo');
                return;
            }
            if (!request.session.user_id) {
                response.status(401).send('Not logged in');
                return;
            }
            response.end(JSON.stringify(info));
        }).select("first_name last_name _id");
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    var id = request.params.id;
    if (!request.session.user_id) {
        response.status(401).send('Not logged in');
        return;
    }
    User.find({_id: id}, function (err, info) {
        if (err) {
            console.error('Problem with provided id. error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (info.length === 0) {
            response.status(400).send('Please send the id of a user');
            return;
        }
        response.end(JSON.stringify(info[0]));
    }).select("_id first_name last_name location description occupation");
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    var id = request.params.id;
    if (!request.session.user_id) {
        response.status(401).send('Not logged in');
        return;
    }
    Photo.find({user_id: id}, function (err, info) {
        if (err) {
            console.error('Doing photo error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (info.length === 0) {
            response.status(200).send([]);
            return;

        }
        async.map(info, function (indiv_photo, callback) {
            async.map(indiv_photo.comments, function(comment, callback1) {
                let user_info = {};
                let new_comment = {
                    comment:comment.comment,
                    date_time: comment.date_time,
                    _id: comment._id};
                User.find({_id: comment.user_id}, function (err_user_find, found_user_info) {
                if (err_user_find) {
                    console.error('Doing /user/id in photos comment error:', err_user_find);
                    response.status(400).send(JSON.stringify(err_user_find));
                    return;
                }
                if (found_user_info.length === 0) {
                    response.status(400).send('Please send the id of a user');
                    return;
                }
                user_info.first_name = found_user_info[0].first_name;
                user_info.last_name = found_user_info[0].last_name;
                user_info._id = found_user_info[0]._id;
                new_comment.user = user_info;
                callback1(null, new_comment);
                });
            }).then(function (new_comments) {
                callback(null, {
                    _id: indiv_photo._id,
                    comments: new_comments,
                    user_id: indiv_photo.user_id,
                    date_time: indiv_photo.date_time,
                    file_name: indiv_photo.file_name
                });
            }).catch(function (error) {
                response.status(400).send("There was an error updating the data. Error:" + JSON.stringify(error));
            });
        }).then(function (new_photo) {
            response.status(200).send(JSON.stringify(new_photo));
        }).catch(function (error) {
            response.status(400).send("There was an error updating the data. Error:" + JSON.stringify(error));
        });
    }).select("_id user_id comments file_name date_time");
});

app.post('/admin/login', function (request, response) {
    if (request.body.login_name === '') {
        response.status(401).send("no login name provided");
    }
    else {
        request.session.login_name = request.body.login_name;
        User.findOne({login_name: request.body.login_name}, function (err, info) {
            if (err) {
                console.error('login user find error:', err);
                response.status(401).send(JSON.stringify(err));
                return;
            }
            if (info === null) {
                console.error('no user matches your login name', err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            if (request.body.password !== info.password) {
                console.error('wrong password', err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            request.session.user_id = info._id;
            response.status(200).end(JSON.stringify(info));
        });
    }
});

app.post('/admin/logout', function (request, response) {
    if (request.session.login_name === '') {
        response.status(401).send("not logged in");
    }
    else {
        request.session.login_name = "";
        let former_user_id = request.session.user_id;
        request.session.user_id = "";
        request.session.destroy(function (error) {
            if (error) {
                
                response.status(401).send("There was an error updating the data. Error:" + JSON.stringify(error));
            }
            response.status(200).send(former_user_id);
        });
    }
});

app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    Photo.findOne({_id: request.params.photo_id}, function (err, info) {
        if (err) {
            response.status(401).send("There was an error retrieving the photo. Error:" + JSON.stringify(err));
        }
        if (request.body.comment === "") {
            response.status(400).send("Bad request: the comment is empty");
        }
        if (!info.comments) {
            info.comments = [];
            info.comments.push({comment: request.body.comment, user_id: request.session.user_id, date_time: Date.now()});
        }
        else {
            info.comments.push({comment: request.body.comment, user_id: request.session.user_id, date_time: Date.now()});
        }
        info.save(function (saveerr) {
            if (saveerr) {
                response.status(401).send("There was an error retrieving the photo. Error:" + JSON.stringify(saveerr));
            }
        });
        response.status(200).send({comment: request.body.comment, user_id: request.session.user_id, date_time: Date.now()});
    });
});



app.post('/photos/new', function (request, response) {
    if (request.session.login_name === '') {
        
        response.status(401).send("not logged in");
    }
    else {
        processFormBody(request, response, function (err) {
            if (err || !request.file) {
                // XXX -  Insert error handling code here.
                
                response.status(400).send("no file in request");
                return;
            }
          
            const timestamp = new Date().valueOf();
            const filename = 'U' +  String(timestamp) + request.file.originalname;
            fs.writeFile("./images/" + filename, request.file.buffer, function (errnew) {
                
              // XXX - Once you have the file written into your images directory under the
              // name filename you can create the Photo object in the database

              if (errnew) {
                response.status(400).send("probelm writing");
              }
              
            });
            let new_photo = {file_name: filename, date_time: timestamp, user_id: request.session.user_id, comments: [], like_count: 0, likes: []};
                Photo.create(new_photo)
                    .then((photoObj) => {
                        photoObj.save();
                    response.status(200).send(JSON.stringify(new_photo));
                    })
                    .catch((err2) => {
                    if (err2) response.status(400).send("Error in /photos/new:", err2);
                    });
            
          });
    }
});

app.post('/user', function (request, response) {
    if (!request.body.login_name) {
        response.status(400).send("empty login name when creating new user");
    }
    User.findOne({login_name: request.body.login_name}, function (err, info) {
        if (err) {
            response.status(400).send("error when checking database for an existing user");
        }
        else if (info) {
            // user found
            response.status(400).send("user already exists");
        }
        else {
            //no user found, create one
            let new_user = {login_name: request.body.login_name, password: request.body.password, first_name: request.body.first_name, last_name: request.body.last_name, location: request.body.location, description: request.body.description, occupation: request.body.occupation};
                User.create(new_user)
                    .then((userObj) => {
                        userObj.save();
                        request.session.login_name = request.body.login_name;
                        request.session.user_id = userObj._id;
                        response.status(200).send(JSON.stringify(userObj));
                    })
                    .catch((err2) => {
                    if (err2) response.status(400).send("Couldn't create new user object", err2);
                    });
        }
    });
});

app.post('/likePhoto', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send('Not logged in');
        return;
    }
    Photo.findOne({_id: request.body.photo_id}, function (err, info) {
        if (err) {
            response.status(401).send("There was an error retrieving the photo. Error:" + JSON.stringify(err));
        }
        User.findOne({_id: request.body.user_id}, function (user_err, user_info) {
            if (user_err) {
                response.status(401).send("There was an error retrieving the photo. Error:" + JSON.stringify(user_err));
            }
            if (info.likes.includes(user_info._id)) {
                response.status(401).send('Already Liked!');
                return;
            }
            if (!info.like_count) {
                info.like_count = 0;
            }
            info.like_count += 1;
            info.likes.push(user_info._id);
            info.save(function (saveerr) {
                if (saveerr) {
                    response.status(401).send("There was an error retrieving the photo. Error:" + JSON.stringify(saveerr));
                }
            });
            response.status(200).end(JSON.stringify(info));
        });
    });
});

app.post('/dislikePhoto', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send('Not logged in');
        return;
    }
    Photo.findOne({_id: request.body.photo_id}, function (err, info) {
        if (err) {
            response.status(401).send("There was an error retrieving the photo. Error:" + JSON.stringify(err));
        }
        User.findOne({_id: request.body.user_id}, function (user_err, user_info) {
            if (user_err) {
                response.status(401).send("There was an error retrieving the photo. Error:" + JSON.stringify(user_err));
            }
            info.like_count -= 1;
            const index = info.likes.indexOf(user_info._id);
            if (index > -1) {
                info.likes.splice(index, 1);
            }
            info.save(function (saveerr) {
                if (saveerr) {
                    response.status(401).send("There was an error retrieving the photo. Error:" + JSON.stringify(saveerr));
                }
            });
            response.status(200).end(JSON.stringify(info));
        });
    });
});

app.get('/photosOfUserPlus/:id', function (request, response) {
    var id = request.params.id;
    if (!request.session.user_id) {
        response.status(401).send('Not logged in');
        return;
    }
    Photo.find({user_id: id}, function (err, info) {
        if (err) {
            console.error('Doing photo error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (info.length === 0) {
            response.status(200).send([]);
            return;

        }
        async.map(info, function (indiv_photo, callback) {
            async.map(indiv_photo.comments, function(comment, callback1) {
                let user_info = {};
                let new_comment = {
                    comment:comment.comment,
                    date_time: comment.date_time,
                    _id: comment._id};
                User.find({_id: comment.user_id}, function (err_user_find, found_user_info) {
                if (err_user_find) {
                    console.error('Doing /user/id in photos comment error:', err_user_find);
                    response.status(400).send(JSON.stringify(err_user_find));
                    return;
                }
                if (found_user_info.length === 0) {
                    response.status(400).send('Please send the id of a user');
                    return;
                }
                user_info.first_name = found_user_info[0].first_name;
                user_info.last_name = found_user_info[0].last_name;
                user_info._id = found_user_info[0]._id;
                new_comment.user = user_info;
                callback1(null, new_comment);
                });
            }).then(function (new_comments) {
                let nueva_photo = {
                    _id: indiv_photo._id,
                    comments: new_comments,
                    user_id: indiv_photo.user_id,
                    date_time: indiv_photo.date_time,
                    file_name: indiv_photo.file_name
                };
                if (!indiv_photo.like_count) {
                    nueva_photo.like_count = 0;
                    nueva_photo.likes = [];
                }
                else {
                    nueva_photo.like_count = indiv_photo.like_count;
                    nueva_photo.likes = indiv_photo.likes;
                }
                callback(null, nueva_photo);
            }).catch(function (error) {
                response.status(400).send("There was an error updating the data. Error:" + JSON.stringify(error));
            });
        }).then(function (new_photo) {

            let ret_photos = new_photo.sort( function(a, b) {
                if (a.like_count > b.like_count) {
                  return -1;
                } else if (a.like_count === b.like_count) {
                  if (a.date_time > b.date_time) {
                    return -1;
                  }
                  else {
                    return 1;
                  }
                }
                else {
                    return 1;
                }
              });
            response.status(200).send(JSON.stringify(ret_photos));
        }).catch(function (error) {
            response.status(400).send("There was an error updating the data. Error:" + JSON.stringify(error));
        });
    }).select("_id user_id comments file_name date_time like_count likes");
});




// app.post('/getLikes', function (request, response) {
//     console.log("we in here");
//     console.log(request.body.photo_id);
//     Photo.findOne({_id: request.body.photo_id}, function (err, info) {
//         if (err) {
//             response.status(401).send("There was an error retrieving the photo. Error:" + JSON.stringify(err));
//         }
//         console.log(info);
//         if (info.like_count) {
//         response.status(200).send(JSON.stringify(info.like_count));
//         }
//         else {
//             info.like_count = 0;
//             response.status(200).send(JSON.stringify(info.like_count));
//         }
//     });
// });



app.post('/activityPhoto', function (request, response) {
    //photo
            //no user found, create one
            User.findOne({_id: request.body.photo.user_id}, function (err, info) {
                if (err) {
                    response.status(400).send("error when checking database for an existing user");
                }
                let new_activity = {date_time: request.body.photo.date_time, user_name: info.first_name + " " + info.last_name, activity_type: "Photo Upload", data:request.body.photo};
                Activity.create(new_activity)
                    .then((actObj) => {
                        actObj.save();
                        response.status(200).send(JSON.stringify(actObj));
                    })
                    .catch((err2) => {
                    if (err2) response.status(400).send("Couldn't create new activity photo object", err2);
                    }); 
            } );  
    });

    app.post('/activityComment', function (request, response) {
        //photo and comment
                //no user found, create one
                User.findOne({_id: request.body.comment.user_id}, function (err, info) {
                    if (err) {
                        response.status(400).send("error when checking database for an existing user");
                    }
                    let new_activity = {date_time: request.body.comment.date_time, user_name: info.first_name + " " + info.last_name, activity_type: "New Comment", data:request.body.photo};
                        Activity.create(new_activity)
                            .then((actObj) => {
                                actObj.save();
                                response.status(200).send(JSON.stringify(actObj));
                            })
                            .catch((err2) => {
                            if (err2) response.status(400).send("Couldn't create new activity photo object", err2);
                            });   
                    });
        });

        app.post('/activityUser', function (request, response) {
            //photo and comment
                    //no user found, create one
                    User.findOne({_id: request.body.user_id}, function (err, info) {
                        if (err) {
                            response.status(400).send("error when checking database for an existing user");
                        }
                        let new_activity = {date_time: Date.now(), user_name: info.first_name + " " + info.last_name, activity_type: request.body.activity_type};
                            Activity.create(new_activity)
                                .then((actObj) => {
                                    actObj.save();
                                    response.status(200).send(JSON.stringify(actObj));
                                })
                                .catch((err2) => {
                                    console.log('err2');
                                    console.log(err2);
                                if (err2) response.status(400).send("Couldn't create new activity photo object", err2);
                                });  
                        }); 
            });

        app.get('/activity/list', function (request, response) {
            Activity.find({}, function (err, info) {
                if (err) {
                    console.error('Doing /activity/list error:', err);
                    response.status(500).send(JSON.stringify(err));
                    return;
                }
                if (info.length === 0) {
                    response.status(500).send('Missing SchemaInfo');
                    return;
                }
                if (!request.session.user_id) {
                    response.status(401).send('Not logged in');
                    return;
                }
                let sorted_activites = info.sort(function(a, b) {
                    if (a.date_time > b.date_time) {
                      return -1;
                    } 
                    else {
                        return 1;
                    }
                  });
                  sorted_activites = sorted_activites.splice(0,5);
                response.end(JSON.stringify(sorted_activites));
            });
    });

    app.get('/activity/list/total', function (request, response) {
        Activity.find({}, function (err, info) {
            if (err) {
                console.error('Doing /activity/list error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                response.status(500).send('Missing SchemaInfo');
                return;
            }
            if (!request.session.user_id) {
                response.status(401).send('Not logged in');
                return;
            }
            let sorted_activites = info.sort(function(a, b) {
                if (a.date_time > b.date_time) {
                  return -1;
                } 
                else {
                    return 1;
                }
              });
            response.end(JSON.stringify(sorted_activites));
        });
});



    app.get('/user/list/activities', function (request, response) {
        //console.log("in user list activity get");
        User.find({}, function (err, info) {
            if (err) {
                console.error('Doing /user/list error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                response.status(500).send('Missing SchemaInfo');
                return;
            }
            if (!request.session.user_id) {
                response.status(401).send('Not logged in');
                return;
            }
            Activity.find({}, function(act_err, act_info) {
                if (act_err) {
                    console.error('Doing /user/list/activities error:', act_err);
                    response.status(500).send(JSON.stringify(act_err));
                    return;
                }
                let user_and_activity_list = [];
                let sorted_activites = act_info.sort(function(a, b) {
                    if (a.date_time > b.date_time) {
                      return -1;
                    } 
                    else {
                        return 1;
                    }
                  });
                for (let i = 0; i < info.length; i++) {
                    let new_pair = {};
                    new_pair.user = info[i];
                    for (let f = 0; f < sorted_activites.length; f++) {
                        if ((info[i].first_name + " " + info[i].last_name) === sorted_activites[f].user_name) {
                            new_pair.activity = sorted_activites[f];
                            break;
                        }
                        if (!new_pair.activity) {
                            new_pair.activity = "no recent activities";
                        }
                    }
                    user_and_activity_list.push(new_pair);
                }
                // console.log("user_and_activity_list");
                // console.log(user_and_activity_list);
                response.send(JSON.stringify(user_and_activity_list));
            });
            // response.end(JSON.stringify(info));
        });
});


app.get('/mostRecentPhoto/:id', function (request, response) {
    var id = request.params.id;
    if (!request.session.user_id) {
        response.status(401).send('Not logged in');
        return;
    }
    Photo.find({user_id: id}, function (err, info) {
        if (err) {
            console.error('Doing photo error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (info.length === 0) {
            response.status(200).send([]);
            return;

        }
        async.map(info, function (indiv_photo, callback) {
            async.map(indiv_photo.comments, function(comment, callback1) {
                let user_info = {};
                let new_comment = {
                    comment:comment.comment,
                    date_time: comment.date_time,
                    _id: comment._id};
                User.find({_id: comment.user_id}, function (err_user_find, found_user_info) {
                if (err_user_find) {
                    console.error('Doing /user/id in photos comment error:', err_user_find);
                    response.status(400).send(JSON.stringify(err_user_find));
                    return;
                }
                if (found_user_info.length === 0) {
                    response.status(400).send('Please send the id of a user');
                    return;
                }
                user_info.first_name = found_user_info[0].first_name;
                user_info.last_name = found_user_info[0].last_name;
                user_info._id = found_user_info[0]._id;
                new_comment.user = user_info;
                callback1(null, new_comment);
                });
            }).then(function (new_comments) {
                callback(null, {
                    _id: indiv_photo._id,
                    comments: new_comments,
                    user_id: indiv_photo.user_id,
                    date_time: indiv_photo.date_time,
                    file_name: indiv_photo.file_name
                });
            }).catch(function (error) {
                response.status(400).send("There was an error updating the data. Error:" + JSON.stringify(error));
            });
        }).then(function (new_photo) {
            let sorted_photos = new_photo.sort(function(a, b) {
                if (a.date_time > b.date_time) {
                  return -1;
                } 
                else {
                    return 1;
                }
              });
              sorted_photos = sorted_photos.splice(0,1);
            response.status(200).send(JSON.stringify(sorted_photos[0]));
        }).catch(function (error) {
            response.status(400).send("There was an error updating the data. Error:" + JSON.stringify(error));
        });
    }).select("_id user_id comments file_name date_time");
});

app.get('/mostCommentedPhoto/:id', function (request, response) {
    var id = request.params.id;
    if (!request.session.user_id) {
        response.status(401).send('Not logged in');
        return;
    }
    Photo.find({user_id: id}, function (err, info) {
        if (err) {
            console.error('Doing photo error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (info.length === 0) {
            response.status(200).send([]);
            return;

        }
        async.map(info, function (indiv_photo, callback) {
            async.map(indiv_photo.comments, function(comment, callback1) {
                let user_info = {};
                let new_comment = {
                    comment:comment.comment,
                    date_time: comment.date_time,
                    _id: comment._id};
                User.find({_id: comment.user_id}, function (err_user_find, found_user_info) {
                if (err_user_find) {
                    console.error('Doing /user/id in photos comment error:', err_user_find);
                    response.status(400).send(JSON.stringify(err_user_find));
                    return;
                }
                if (found_user_info.length === 0) {
                    response.status(400).send('Please send the id of a user');
                    return;
                }
                user_info.first_name = found_user_info[0].first_name;
                user_info.last_name = found_user_info[0].last_name;
                user_info._id = found_user_info[0]._id;
                new_comment.user = user_info;
                callback1(null, new_comment);
                });
            }).then(function (new_comments) {
                callback(null, {
                    _id: indiv_photo._id,
                    comments: new_comments,
                    user_id: indiv_photo.user_id,
                    date_time: indiv_photo.date_time,
                    file_name: indiv_photo.file_name
                });
            }).catch(function (error) {
                response.status(400).send("There was an error updating the data. Error:" + JSON.stringify(error));
            });
        }).then(function (new_photo) {
            let sorted_photos = new_photo.sort(function(a, b) {
                if (a.comments.length > b.comments.length) {
                  return -1;
                } 
                else {
                    return 1;
                }
              });
              sorted_photos = sorted_photos.splice(0,1);
            response.status(200).send(JSON.stringify(sorted_photos[0]));
        }).catch(function (error) {
            response.status(400).send("There was an error updating the data. Error:" + JSON.stringify(error));
        });
    }).select("_id user_id comments file_name date_time");
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


