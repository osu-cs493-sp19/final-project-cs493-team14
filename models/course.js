/*
 * Course schema and data accessor methods;
 */

const { ObjectId } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
const bcrypt = require('bcryptjs')

/*
 * Schema describing required/optional fields of a course object.
 */
const CourseSchema = {
    subject: { required: true },
    number: { required: true },
    title: { required: true },
    term: { required: true },
    instructorId: { required: true }
  };
  exports.CourseSchema = CourseSchema;

 
  /*
 * Executes a DB query to return a single page of courses.  Returns a
 * Promise that resolves to an array containing the fetched page of Coursees.
 */
 exports.getCoursePage = async function(page) {
  const db = getDBReference();
  const collection = db.collection('course');
  const count = await collection.countDocuments();
    /*
    * Compute last page number and make sure page is within allowed bounds.
    * Compute offset into collection.
    */
    const pageSize = 10;
    const lastPage = Math.ceil(count / pageSize);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const offset = (page - 1) * pageSize;

    const results = await collection.find({})
        .sort({ _id: 1 })
        .skip(offset)
        .limit(pageSize)
        .toArray();

    return {
        courses: results,
        page: page,
        totalPages: lastPage,
        pageSize: pageSize,
        count: count,
        links: links
    };
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
    const result = await collection.insertOne(course);
    return result.insertedId;
  };

  exports.deleteCourseById = async function (id) {

    const db = getDBReference();
    const collection = db.collection('courses');
    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });
    //console.log(result);
    return result.deletedCount > 0;
   }