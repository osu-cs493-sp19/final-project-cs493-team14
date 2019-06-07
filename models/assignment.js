const router = require('express').Router();
const validation = require('../lib/validation');
const { extractValidFields } = require('../lib/validation');
//const businesses = require('../data/businesses');
//const { reviews } = require('./reviews');
//const { photos } = require('./photos');
const { getDBReference } = require('../lib/mongo');
const ObjectID = require('mongodb').ObjectID;
exports.router = router;
//exports.businesses = businesses;

/*
 * Schema describing required/optional fields of a business object.
 */
exports.assignmentSchema = {
courseid: { required: true },
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
  
  const test = collection.aggregate([
  {
    $match: { _id: id}
  },
  {
    $lookup: {
      from: "reviews",
      localField: "_id",
      foreignField: "businessid",
      as: "reviews"
    }
  },
  {
    $lookup: {
      from: "photos",
      localField: "_id",
      foreignField: "businessid",
      as: "photos"
    }
  }
]).toArray();

console.log(test);
  
  const results = await collection.find({
    //_id: new ObjectID(id)
	_id:id
  }).toArray();
  return test;
}

//NEW POST create a new submission
exports.insertNewAssignment = async function(assignment) {
  // const lodgingToInsert = extractValidFields(lodging);
  const db = getDBReference();
  const collection = db.collection('assignments');
  var newid = (collection.find().count())
  console.log(collection.countDocuments({}));
  const result = await collection.insertOne(
  {_id: newid,
  assignment
  });
  return result.insertedId;
};


//NEW PUT update a submission
exports.updateAssignmentByID = async function updateAssignmentByID(id, assignment) {
  const assignmentValues = {
courseid: assignment.courseid,
title: assignment.title,
points: assignment.points,
due: assignment.due
  };
  const db = getDBReference();
  const collection = db.collection('assignments');
  const result = await collection.replaceOne(
    { _id: id },
     assignmentValues
  );
  return result.matchedCount > 0;
}


//NEW DELETE a submission
exports.deleteAssignmentByID = async function deleteAssignmentByID(id) {
   const db = getDBReference();
   const collection = db.collection('assignments');
    const result = await collection.deleteOne({
    //_id: new ObjectID(id)
	_id:id
  });
  console.log(result.deletedCount)
  return result.deletedCount > 0;
}
