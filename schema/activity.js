"use strict";
/* jshint node: true */

var mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Comment.
 */
var activitySchema = new mongoose.Schema({
  date_time: { type: Date, default: Date.now },
  user_name: String,
  activity_type: String,
  data: {},
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
var Activity = mongoose.model("Activity", activitySchema);

/**
 * Make this available to our application.
 */
module.exports = Activity;
