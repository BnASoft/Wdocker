//./routes/droute.js
"use strict";


  var express = require('express');
  var router = express.Router();

  router.use(function timeLog(req, res, next) {
    // console.log('Time: ', Date.now());
    res.setHeader("Content-Type", "text/html");

    next();
  });
  var path = require('path');
  router.get('/tmp', (req, res) => {
        res.render("tmp.ejs");
  });
  router.get('/index', (req, res) => {
        res.render("index.ejs");
  });

  router.get('/container', (req, res) => {
        res.render("container.ejs");
  });


  router.get('/network', (req, res) => {
        res.render("network.ejs");
  });

  router.get('/image', (req, res) => {
        res.render("image.ejs");
  });

  router.get('/volume', (req, res) => {
        res.render("volume.ejs");
  });

  router.get('/swarm' , (req, res) => {
        res.render("swarm.ejs");
  });

  router.get('/node', (req, res) => {
        res.render("node.ejs");
  });

  router.get('/terminal' , (req, res) => {
        res.render("terminal.ejs");
  });

  router.get('/graph', (req, res) => {
        res.render("graph.ejs");
  });

  router.get('/dockerfile' ,  (req, res) => {
        res.render("dockerfile.ejs");
  });

  router.get('/service' ,  (req, res) => {
        res.render("service.ejs");
  });

  router.get('/task' ,  (req, res) => {
        res.render("task.ejs");
  });

  router.get('/settings' , (req, res) => {
        res.render("settings.ejs");
  });

  router.get('/vnc' , (req, res) => {
    // res.redirect('http://192.168.0.108:3000/myapp/vnc_core.ejs');
        res.render("vnc.ejs");
  });

  router.get('/vnc_core.ejs' , (req, res) => {
        res.render("./iframe/vnc_core.ejs");
  });

  router.get('/dashboard.ejs' , (req, res) => {
        res.render("./iframe/dashboard.ejs");
  });

  // router.get('*' , (req, res) => {
  //       res.render("404.ejs");
  // });



module.exports = router;