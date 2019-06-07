/*
* Fetch a user from the DB based on user ID.
*/
async function getCoursesByInstructorId(id, includePassword) {
    const db = getDBReference();
    const collection = db.collection('courses');
    if (!ObjectId.isValid(id)) {
      return null;
    } else {
      const results = await collection
        .find({ instructorId: new ObjectId(id) })
        .toArray();
      return results[0];
    }
};
exports.getCoursesByInstructorId = getCoursesByInstructorId;