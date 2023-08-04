
const Sequelize = require('sequelize');

var sequelize = new Sequelize('bgqziebk', 'bgqziebk', 'CMFRZ4ucFDdcUK21gj5GKTlaZ6Mo_uuH', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    status: Sequelize.STRING,
    TA: Sequelize.BOOLEAN
});

var Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING,
});

Course.hasMany(Student, {foreignKey: 'course'});

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) { 
        sequelize.sync().then(
            resolve()
        ).catch(
            reject("unable to sync the database")
        );       
    });
}

module.exports.getAllStudents = function(){
    return new Promise(function (resolve, reject) { 

        sequelize.sync().then(
            function () {
                Student.findAll({ 
                    attributes: ['studentNum','firstName','lastName','email','addressCity','status','course','addressStreet','addressProvince']
                    }).then(function(data){        
                        console.log("All first names");
                        resolve(data);
                     }).catch(()=>reject("no results returned"))
            }
        ).catch(()=>reject("no results returned"));
    });
}


module.exports.getCourses = function(){
    return new Promise(function (resolve, reject) { 

        sequelize.sync().then(
            function () {
                Course.findAll({ 
                    attributes: ['courseId','courseCode','courseDescription']
                    }).then(function(data){        
                        resolve(data);
                     }).catch(()=>reject("no results returned"))
            }
        ).catch(()=>reject("no results returned"));
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) { 

        sequelize.sync().then(
            function () {
                Student.findAll({ 
                    attributes: ['studentNum','firstName','lastName','email','addressCity','status','course','addressStreet','addressProvince'],
                    where: {
                        studentNum: num
                    }
                    }).then(function(data){   
                        resolve(data[0]);
                     }).catch(()=>reject("no results returned"))
            }
        ).catch(()=>reject("no results returned"));
    });
};

module.exports.getStudentsByCourse = function (courseId) {
    return new Promise(function (resolve, reject) { 

        sequelize.sync().then(
            function () {
                Student.findAll({ 
                    attributes: ['studentNum','firstName','lastName','email','addressCity','status','course','addressStreet','addressProvince'],
                    where: {
                        course: courseId
                    }
                    }).then(function(data){        
                        console.log("All first names");
                        resolve(data);
                     }).catch(()=>reject("no results returned"))
            }
        ).catch(()=>reject("no results returned"));
    });
};

module.exports.getCourseById = function (id) {
    return new Promise(function (resolve, reject) { 

        sequelize.sync().then(
            function () {
                Course.findAll({ 
                    attributes: ['courseId','courseCode','courseDescription'],
                    where: {
                        courseId: id
                    }
                    }).then(function(data){        
                        console.log("All first names");
                        resolve(data[0]);
                     }).catch(()=>reject("no results returned"))
            }
        ).catch(()=>reject("no results returned"));
    });
};

module.exports.addStudent = function (studentData) {

    studentData.TA = (studentData.TA) ? true : false;
    for(const key in studentData)
    {
        if(studentData[key]=="")
          studentData[key] = null;
    }
    return new Promise(function (resolve, reject) { 
        Student.create({
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            addressStreet: studentData.addressStreet,
            addressCity: studentData.addressCity,
            addressProvince: studentData.addressProvince,
            status: studentData.status,
            TA: studentData.TA,
            course: studentData.course
        }).then(
            function (std) {
                console.log("student created");
                resolve("student created successfuly");
            }
        ).catch(()=>reject("unable to create student"));
    });

};

module.exports.updateStudent = function (studentData) {
    studentData.TA = (studentData.TA) ? true : false;
    for(const key in studentData)
    {
        if(studentData[key]=="")
          studentData[key] = null;
    }
    return new Promise(function (resolve, reject) { 
        Student.update({
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            addressStreet: studentData.addressStreet,
            addressCity: studentData.addressCity,
            addressProvince: studentData.addressProvince,
            status: studentData.status,
            TA: studentData.TA,
            course: studentData.course
        },{
            where: { studentNum:studentData.studentNum }
        }
        ).then(
            function (std) {
                console.log(`student ${std.studentNum} updated successfuly`);
                resolve(`student ${std.studentNum} updated successfuly`);
            }
        ).catch(()=>reject("unable to update student"));
    });
};

module.exports.deleteStudentByNum = function (stdNum) {
    return new Promise(function (resolve, reject) { 

        sequelize.sync().then(
            function () {
                Student.destroy({ 
                    where: {
                        studentNum: stdNum
                    }
                    }).then(function(){        
                        console.log("destroyed");
                        resolve("destroyed");
                     }).catch(()=>reject("destroy was rejected"))
            }
        ).catch(()=>reject("destroy was rejected"));
    });
};

module.exports.addCourse = function (courseData) {

    console.log(courseData)

    for(const key in courseData)
    {
        if(courseData[key]=="")
        courseData[key] = null;
    }
    return new Promise(function (resolve, reject) { 
        Course.create({
            courseCode: courseData.courseCode,
            courseDescription: courseData.courseDescription,
        }).then(
            function (crs) {
                console.log("course created");
                resolve("course created successfuly");
            }
        ).catch(()=>reject("unable to create course"));
    });

};

module.exports.updateCourse = function (courseData) {

    for(const key in courseData)
    {
        if(courseData[key]=="")
             courseData[key] = null;
    }
    return new Promise(function (resolve, reject) { 
        Course.update({
            courseCode: courseData.courseCode,
            courseDescription: courseData.courseDescription,
        },{
            where: { courseId:courseData.courseId }
        }
        ).then(
            function (crs) {
                console.log(`course ${crs.courseId} updated successfuly`);
                resolve(`course ${crs.courseId} updated successfuly`);
            }
        ).catch(()=>reject("unable to update course"));
    });

};

module.exports.deleteCourseById = function (id) {
    return new Promise(function (resolve, reject) { 

        sequelize.sync().then(
            function () {
                Course.destroy({ 
                    where: {
                        courseId: id
                    }
                    }).then(function(){        
                        console.log("destroyed");
                        resolve("destroyed");
                     }).catch(()=>reject("destroy was rejected"))
            }
        ).catch(()=>reject("destroy was rejected"));
    });
};
