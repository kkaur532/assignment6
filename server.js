/*********************************************************************************
 * WEB322 – Assignment 6
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Kiranpreet Kaur   Student ID: 166165217    Date: 04-08-2023
 * 
 * Online (Cyclic) Link: 
 *
 ********************************************************************************/

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");
const Sequelize = require('sequelize');
const clientSessions = require("client-sessions");
const { resolve } = require("path");


const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ 
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }        
    }
}));

app.set('view engine', '.hbs');

app.use(express.static("public"));
app.use(clientSessions({
    cookieName: "session", 
    secret: "assignment6_web322",
    duration: 2 * 60 * 1000, 
    activeDuration: 1000 * 60 
  }));

app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

// set up sequelize to point to our postgres database
var sequelize = new Sequelize('bgqziebk', 'bgqziebk', 'CMFRZ4ucFDdcUK21gj5GKTlaZ6Mo_uuH', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });


function ensureLogin(req, res, next) {
        if (!req.session.user) {
          res.redirect("/login");
        } else {
          next();
        }
}

app.get("/",ensureLogin, (req,res) => {
    // res.render("home");
    res.render("dashboard", {user: req.session.user});
});

app.get("/about",ensureLogin, (req,res) => {
    res.render("about");
});

app.get("/htmlDemo",ensureLogin, (req,res) => {
    res.render("htmlDemo");
});

app.get("/students",ensureLogin, (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course).then((data) => {
            res.render("students", {students: data});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    } else {
        data.getAllStudents().then((data) => {
            if(data.length > 0)
                res.render("students", {students: data});
            else
                res.render("students",{ message: "no results" });
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    }
});

app.get("/students/add", ensureLogin,(req,res) => {
    data.getCourses().then((data) => {
        if(data.length > 0)
            res.render("addStudent", {courses: data});
        else
            res.render("addStudent", {courses: []});
    }).catch((err) => {
        res.render("addStudent", {courses: []});
    });
});


app.post("/students/add",ensureLogin, (req, res) => {
    data.addStudent(req.body).then(()=>{
      res.redirect("/students");
    });
  });

app.get("/students/:studentNum", (req, res) => { 
        let viewData = {};
        data.getStudentByNum(req.params.studentNum).then((data) => { 
        if (data) {
        viewData.student = data;  
        } else {
        viewData.student = null; 
        }
        }).catch(() => {
             viewData.student = null; 
        }).then(data.getCourses).then((data) => {
        viewData.courses = data; 
        for (let i = 0; i < viewData.courses.length; i++) {
        if (viewData.courses[i].courseId == viewData.student.course) {
        viewData.courses[i].selected = true; }
        }
        }).catch(() => {
        viewData.courses = [];
        }).then(() => {
        if (viewData.student == null) { 
        res.status(404).send("Student Not Found"); } else {
        res.render("student", { viewData: viewData });  
        }
        }); });



app.post("/student/update",ensureLogin, (req, res) => {
    data.updateStudent(req.body).then(() => {
        res.redirect("/students");
    });
});

app.get("/students/delete/:studentNum",ensureLogin, (req, res) => {
    data.deleteStudentByNum(req.params.studentNum).then((data) => {
        res.redirect("/students"); 
    }).catch((err) => {
        res.status(500).send("Unable to Remove Student / Student not found")
    });
});


app.get("/courses",ensureLogin, (req,res) => {
    data.getCourses().then((data)=>{
        if(data.length > 0)
        res.render("courses", {courses: data});
    else
        res.render("courses",{ message: "no results" });
    }).catch(err=>{
        res.render("courses", {message: "no results"});
    });
});

app.get("/courses/add",ensureLogin, (req,res) => {
    res.render("addCourse");
});


app.post("/courses/add",ensureLogin, (req, res) => {
    data.addCourse(req.body).then(()=>{
      res.redirect("/courses");
    });
  });

app.post("/course/update",ensureLogin, (req, res) => {
    data.updateCourse(req.body).then(() => {
        res.redirect("/courses");
    });
});

app.get("/courses/:id",ensureLogin, (req, res) => {
    data.getCourseById(req.params.id).then((data) => {
        if(data != undefined)
        res.render("course", { course: data }); 
    else
        res.status(404).send("Course Not Found")
    }).catch((err) => {
        res.render("course",{message:"no results"}); 
    });
});

app.get("/courses/delete/:id",ensureLogin, (req, res) => {
    data.deleteCourseById(req.params.id).then((data) => {
        res.redirect("/courses"); 
    }).catch((err) => {
        res.status(500).send("Unable to Remove Course / Course not found")
    });
});

const user = {
    username: "sampleuser",
    password: "samplepassword",
    email: "sampleuser@example.com"
  };

app.get("/login", function(req, res) {
    res.render("login");
  });

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if(username === "" || password === "") {
      return res.render("login", { errorMsg: "Missing credentials."});
    }
  
    if(username === user.username && password === user.password){

      req.session.user = {
        username: user.username,
        email: user.email
      };
  
      res.redirect("/dashboard");
    } else {
      res.render("login", { errorMsg: "invalid username or password!"});
    }
  });
app.get("/dashboard", ensureLogin, (req, res) => {
    res.render("dashboard", {user: req.session.user});
  });

app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect("/login");
  });

app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});


data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
