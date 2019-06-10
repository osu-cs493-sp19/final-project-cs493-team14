const router = require('express').Router();
const validation = require('../lib/validation');
const { extractValidFields } = require('../lib/validation');
const { getUserById, getUserByEmail, validateUser, checkUserisAdmin } = require('../models/user');
const { getDBReference } = require('../lib/mongo');
const ObjectID = require('mongodb').ObjectID;
exports.router = router;


/*
 * Schema describing required/optional fields of a business object.
 */
exports.assignmentSchema = {
courseId: { required: true },
title: { required: true },
points: { required: true },
due: { required: true }
};

//NEW GET all businesses
exports.getAssignmentsPage = async function (page) {
  const db = getDBReference();
  const collection = db.collection('assignments');
  const count = await collection.countDocuments();

  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page < 1 ? 1 : page;
  page = page > lastPage ? lastPage : page;
  const offset = (page - 1) * pageSize;

  const results = await collection.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray();

  return {
    assignments: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
};

exports.getAssignmentByID = async function getAssignmentByID(id) { 
const db = getDBReference();
  const collection = db.collection('assignments');
  console.log("in here");
  const results = await collection.find({
    _id: new ObjectID(id)
	//_id:id
  }).toArray();
  return results[0];
}

//NEW POST create a new submission
exports.insertNewAssignment = async function(assignment) {
  // const lodgingToInsert = extractValidFields(lodging);
  const db = getDBReference();
  const collection = db.collection('assignments');
  //var newid = (collection.find().count())
  console.log(collection.countDocuments({}));
  const result = await collection.insertOne(
  {
  assignment
  });
  return result.insertedId;
};


//NEW PUT update a submission
exports.updateAssignmentByID = async function updateAssignmentByID(id, assignment) {
  const assignmentValues = {
courseId: assignment.courseId,
title: assignment.title,
points: assignment.points,
due: assignment.due
  };
  const db = getDBReference();
  const collection = db.collection('assignments');
  const result = await collection.replaceOne(
    { _id: new ObjectID(id) },
     assignmentValues
  );
console.log(result[0])
  return result.matchedCount > 0;
}


//NEW DELETE a submission
exports.deleteAssignmentByID = async function deleteAssignmentByID(id) {
   const db = getDBReference();
   const collection = db.collection('assignments');
    const result = await collection.deleteOne({
    _id: new ObjectID(id)
	//_id: id
  });
  console.log(result.deletedCount)
  return result.deletedCount > 0;
}
