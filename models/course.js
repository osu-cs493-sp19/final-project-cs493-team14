/*
 * Course schema and data accessor methods;
 */

const { ObjectId } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
const bcrypt = require('bcryptjs');
const ObjectID = require('mongodb').ObjectID;

/*
 * Schema describing required/optional fields of a course object.
 */
const CourseSchema = {
  subject: { required: true },
  number: { required: true },
  title: { required: true },
  term: { required: true },
  instructorId: { required: true },
  //enrolledStudents: {required: false}
};
exports.CourseSchema = CourseSchema;
 
/*
 * Executes a DB query to return a single page of courses.  Returns a
 * Promise that resolves to an array containing the fetched page of Coursees.
*/
exports.getAllCourses = async function(type, query) {
  const db = getDBReference();
  const collection = db.collection('courses');
  const count = await collection.countDocuments();
  if (type == 1) {
    var page = query;
    const pageSize = 10;
    const lastPage = Math.ceil(count / pageSize);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * pageSize;
  
    const results = await collection.find({})
      .project({ enrolledStudents: 0 })
      .skip(offset)
      .limit(pageSize)
      .toArray();
    
    return {
        courses: results,
        page: page,
        totalPages: lastPage,
        pageSize: pageSize,
        count: count
    };
  } else if (type == 2) {
    const subjectQ = query.toString();
    const results = await collection.find({subject: subjectQ})
      .project({ enrolledStudents: 0 })
      .toArray();
  
    return {
      courses: results
    };
  } else if (type == 3) {
    const numberQ = query.toString();
    const results = await collection.find({number: numberQ})
      .project({ enrolledStudents: 0 })
      .toArray();
  
    return {
      courses: results
    };
  } else if (type == 4) {
    const termQ = query.toString();
    const results = await collection.find({term: termQ})
      .project({ enrolledStudents: 0 })
      .toArray();
  
    return {
      courses: results
    };
  } else {
    const results = await collection.find({})
      .project({ enrolledStudents: 0 })
      .toArray();
    return {
      courses: results
    };
  }
};

/*
* Executes a DB query to fetch information about a single specified
* Course based on its ID.  Does not fetch photo data for the
* course.  Returns a Promise that resolves to an object containing
* information about the requested Course.  If no Course with the
* specified ID exists, the returned Promise will resolve to null.
*/
exports.getCourseById = async function (id) {
   const db = getDBReference();
   const collection = db.collection('courses');
   if (!ObjectId.isValid(id)) {
     return null;
   } else {
     const results = await collection
       .find({ _id: new ObjectId(id) })
       .project({ enrolledStudents: 0 })
       .toArray();
     return results[0];
   }
}

/*
 * Executes a DB query to insert a new course into the database.  Returns
 * a Promise that resolves to the ID of the newly-created course entry.
*/
exports.insertNewCourse= async function (course) {
    const db = getDBReference();
    const collection = db.collection('courses');
    const result = await collection.insertOne({course});
    return result.insertedId;
};

exports.deleteCourseById = async function (id) {
    const db = getDBReference();
    const collection = db.collection('courses');
    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });
    return result.deletedCount > 0;
}

/*
* get students by course id
*/
async function getStudentsByCourseId(id) {
  const db = getDBReference();
  const collection = db.collection('courses');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .project({ _id: 0, subject: 0, number: 0, title: 0, term: 0, instructorID: 0 })
      .toArray();
    return results[0];
  }
  console.log("instructor Courses results: ", results[0]);
  return results[0];
};
exports.getStudentsByCourseId = getStudentsByCourseId;

/*
* get roster by course id
*/
async function getRosterByCourseId(id) {
  const db = getDBReference();
  const collection = db.collection('courses');
  const midResults = await collection
    .find({ _id: new ObjectId(id) })
    .toArray();
  const results = await collection.aggregate([
    {
      $match: { _id: new ObjectID(id) },
    },
    {
      $unwind: "$enrolledStudents"
    },
    {
      $lookup: {
        from: "users",
        localField: "enrolledStudents",
        foreignField: "_id",
        as: "studentsRoster"
      }
    },
    {
      $project : { _id: 0, subject: 0, number: 0, title: 0, term: 0, instructorID: 0, enrolledStudents: 0, "studentsRoster.role" : 0 , "studentsRoster.password" : 0 }
    }
  ]).toArray();
  console.log("instructor Courses results: ", results);
  var csv = "ID, Name, Email\n";
  results.forEach(function(elem) {
       csv += elem.studentsRoster[0]._id;
       csv += ", ";
       csv += elem.studentsRoster[0].name;
       csv += ", ";
       csv += elem.studentsRoster[0].email;
       csv += "\n";
  });
  return csv;
};
exports.getRosterByCourseId = getRosterByCourseId;

/*
* get students by assignment id
*/
async function getAssignmentsByCourseId(id) {
  console.log("in");
  const db = getDBReference();
  const collection = db.collection('courses');
  console.log("b4 results");
  const results = await collection.aggregate([
    {
      $match: { _id: new ObjectID(id) }
    },
    {
      $lookup: {
        from: "assignments",
        localField: "_id",
        foreignField: "courseId",
        as: "courseAssignments"
      }
    },
    { 
      $project : { "courseAssignments.courseId" : 0 , "courseAssignments.title" : 0, 
      "courseAssignments.points" : 0, "courseAssignments.due" : 0 }
    }
  ]).toArray();
  console.log("course Assignments results: ", results[0]);
  return results[0];
};
exports.getAssignmentsByCourseId = getAssignmentsByCourseId;

async function updateCourseByID(id, course) {
  const courseValues = {
    subject: course.subject,
    number: course.number,
    title: course.title,
    term: course.term,
    instructorId: course.instructorId
  };
  const db = getDBReference();
  const collection = db.collection('courses');
  const result = await collection.replaceOne(
    { _id: new ObjectID(id) },
     courseValues
  );
  console.log(result[0])
  return result.matchedCount > 0;
}
exports.updateCourseByID = updateCourseByID;