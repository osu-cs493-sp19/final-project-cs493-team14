/*
 * User schema and data accessor methods.
 */
const { ObjectId } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
const bcrypt = require('bcryptjs');

/*
 * Schema describing required/optional fields of a photo object.
 */
const UserSchema = {
    name: { required: true },
    role: { required: true },
    email: { required: true },
    password: {required: true},
};
exports.UserSchema = UserSchema;

/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
    const userToInsert = extractValidFields(user, UserSchema);
    const db = getDBReference();
    const collection = db.collection('users');
  
    const passwordHash = await bcrypt.hash(userToInsert.password, 8);
    userToInsert.password = passwordHash;
  
    const result = await collection.insertOne(userToInsert);
    return result.insertedId;
};
  
  
/*
* Fetch a user from the DB based on user ID.
*/
async function getUserById(id, includePassword) {
    const db = getDBReference();
    const collection = db.collection('users');
    if (!ObjectId.isValid(id)) {
      return null;
    } else {
      const projection = includePassword ? {} : { password: 0 };
      const results = await collection
        .find({ _id: new ObjectId(id) })
        .project(projection)
        .toArray();
      return results[0];
    }
};
exports.getUserById = getUserById;

/*
* Fetch a user from the DB based on user email.
*/
async function getUserByEmail(userEmail, includePassword) {
    const db = getDBReference();
    const collection = db.collection('users');
    const projection = includePassword ? {} : { password: 0 };
    const results = await collection
        .find({ email: userEmail })
        .project(projection)
        .toArray();
    return results[0];
};
exports.getUserByEmail = getUserByEmail;

async function getCoursesByInstructorId(id) {
    const db = getDBReference();
    const collection = db.collection('users');
    const results = await collection.aggregate([
      {
        $match: { _id: id }
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "instructorId",
          as: "instructorCourses"
        }
      }
    ]).toArray();
    console.log("instructor Courses results: ", results[0]);
    return results[0];
};
exports.getCoursesByInstructorId = getCoursesByInstructorId;
  
exports.validateUser = async function (email, password) {
    const user = await getUserByEmail(email, true);
    console.log("user: ", user);
    console.log("password, user.password: ", password, ", ", user.password);
    const authenticated = user && await bcrypt.compare(password, user.password);
    console.log("authenticated: ", authenticated);
    return authenticated;
};

/* Checks if user is admin*/
exports.checkUserisAdmin = async function (id) {
    const db = getDBReference();
    const collection = db.collection('users');
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray();
    if (results[0].role == "student") {
        return 0;
    } else if (results[0].role == "instructor") {
        return 1;
    } else if (results[0].role == "admin") {
        return 2;
    }
  };