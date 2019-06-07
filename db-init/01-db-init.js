db.users.insertMany([
    {
        "name": "Harry Potter",
        "role": "student",
        "email": "harry@email.com",
        "password": "hunter2"
    },
    {
        "name": "Albus Dumbledore",
        "role": "admin",
        "email": "albus@email.com",
        "password": "hunter2"
    },
    {
        "name": "Minerva McGonogall",
        "role": "instructor",
        "email": "minerva@email.com",
        "password": "hunter2"
    },
    {
        "name": "Ronald Weasley",
        "role": "student",
        "email": "ron@email.com",
        "password": "hunter2"
    },
    {
        "name": "Hermoine Granger",
        "role": "student",
        "email": "hermoine@email.com",
        "password": "hunter2"
    },
    {
        "name": "Neville Longbottom",
        "role": "student",
        "email": "neville@email.com",
        "password": "hunter2"
    },
    {
        "name": "Draco Malfoy",
        "role": "student",
        "email": "draco@email.com",
        "password": "hunter2"
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

db.assignments.insertMany([
    {
        "courseId": 0,
        "title": "Assignment 0",
        "points": 50,
        "due": "2019-06-14T17:00:00-07:00",
    },
    {   
        "courseId": 1,
        "title": "Assignment 1",
        "points": 100,
        "due": "2019-06-14T17:00:00-07:00",
    },
    {
        "courseId": 2,
        "title": "Assignment 2",
        "points": 200,
        "due": "2019-06-14T17:00:00-07:00",
    },
    {
        "courseId": 3,
        "title": "Assignment 3",
        "points": 300,
        "due": "2019-06-14T17:00:00-07:00",
    }
]);

  courseId:
    oneOf:
      - type: integer
      - type: string
    description: >
      ID of the Course associated with the Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
    example: "123"
  title:
    type: string
    description: Assignment description.
    example: Assignment 3
  points:
    type: integer
    description: Possible points for the Assignment.
    example: 100
  due:
    type: string
    format: date-time
    description: >
      Date and time Assignment is due.  Should be in ISO 8601 format.
    example: "2019-06-14T17:00:00-07:00"