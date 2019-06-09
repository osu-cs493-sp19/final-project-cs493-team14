db.users.insertMany([
    {
        "name": "Harry Potter",
        "role": "student",
        "email": "harry@email.com",
        "password": "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike"
    },
    {
        "name": "Albus Dumbledore",
        "role": "admin",
        "email": "albus@email.com",
        "password": "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike"
    },
    {
        "name": "Minerva McGonogall",
        "role": "instructor",
        "email": "minerva@email.com",
        "password": "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike"
    },
    {
        "name": "Ronald Weasley",
        "role": "student",
        "email": "ron@email.com",
        "password": "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike"
    },
    {
        "name": "Hermoine Granger",
        "role": "student",
        "email": "hermoine@email.com",
        "password": "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike"
    },
    {
        "name": "Neville Longbottom",
        "role": "student",
        "email": "neville@email.com",
        "password": "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike"
    },
    {
        "name": "Draco Malfoy",
        "role": "student",
        "email": "draco@email.com",
        "password": "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike"
    },
    {
        "name": "Severus Snape",
        "role": "instructor",
        "email": "severus@email.com",
        "password": "hunter2"
    },
    {
        "name": "Filius Flitwick",
        "role": "instructor",
        "email": "filius@email.com",
        "password": "hunter2"
    },
    {
        "name": "Pomona Sprout",
        "role": "instructor",
        "email": "pomona@email.com",
        "password": "hunter2"
    }
]);

db.courses.insertMany([
    {
        "subject": "CH",
        "number": "1",
        "title": "Charms",
        "term": "sp19",
        "instructorID": db.users.find()[8]._id,
        "enrolledStudents": [db.users.find()[0]._id, db.users.find()[3]._id,
                       db.users.find()[4]._id, db.users.find()[5]._id]
    },
    {
        "subject": "TR",
        "number": "1",
        "title": "Transfiguration",
        "term": "sp19",
        "instructorID": db.users.find()[2]._id,
        "enrolledStudents": [db.users.find()[0]._id, db.users.find()[3]._id,
        db.users.find()[4]._id, db.users.find()[5]._id]
    },
    {
        "subject": "PO",
        "number": "1",
        "title": "Potions",
        "term": "sp19",
        "instructorID": db.users.find()[7]._id,
        "enrolledStudents": [db.users.find()[0]._id, db.users.find()[3]._id,
        db.users.find()[4]._id, db.users.find()[5]._id]
    },
    {
        "subject": "CS",
        "number": "493",
        "title": "Cloud Application Development",
        "term": "sp19",
        "instructorID": db.users.find()[2]._id,
        "enrolledStudents": [db.users.find()[0]._id, db.users.find()[3]._id,
        db.users.find()[4]._id, db.users.find()[5]._id]
    }
]);

db.assignments.insertMany([
    {
        "courseId": db.courses.find()[0]._id,
        "title": "Assignment 0",
        "points": 50,
        "due": "2019-06-14T17:00:00-07:00",
    },
    {   
        "courseId": db.courses.find()[1]._id,
        "title": "Assignment 1",
        "points": 100,
        "due": "2019-06-14T17:00:00-07:00",
    },
    {
        "courseId": db.courses.find()[2]._id,
        "title": "Assignment 2",
        "points": 200,
        "due": "2019-06-14T17:00:00-07:00",
    },
    {
        "courseId": db.courses.find()[3]._id,
        "title": "Assignment 3",
        "points": 300,
        "due": "2019-06-14T17:00:00-07:00",
    },
    {
        "courseId": db.courses.find()[0]._id,
        "title": "Assignment 4",
        "points": 500,
        "due": "2019-06-14T17:00:00-07:00",
    }
]);

