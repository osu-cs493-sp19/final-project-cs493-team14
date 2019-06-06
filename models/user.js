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
    email: { required: true },
    password: {required: true},
    admin: {required: false}
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
  
exports.validateUser = async function (id, password) {
    const user = await getUserById(id, true);
    const authenticated = user && await bcrypt.compare(password, user.password);
    return authenticated;
};