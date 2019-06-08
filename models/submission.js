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
exports.submissionSchema = {
  studentid: { required: true },
  timestamp: { required: true }
};

//NEW GET all businesses
exports.getSubimissionsPage = async function (page) {
  const db = getDBReference();
  const collection = db.collection('submissions');
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
    submissions: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
};

exports.getSubmissionByID = async function getSubmissionByID(id) {
  const db = getDBReference();
  const collection = db.collection('submissions');
  
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
exports.insertNewSubmission = async function(submission) {
  // const lodgingToInsert = extractValidFields(lodging);
  const db = getDBReference();
  const collection = db.collection('submissions');
  var newid = (collection.find().count())
  console.log(collection.countDocuments({}));
  const result = await collection.insertOne(
  {_id: newid,
  submission
  });
  return result.insertedId;
};


//NEW PUT update a submission
exports.updateSubmissionByID = async function updateSubmissionByID(id, submission) {
  const submissionValues = {
  studentid: submission.studentid,
  timestamp: submission.timestamp
  };
  const db = getDBReference();
  const collection = db.collection('submissions');
  const result = await collection.replaceOne(
    { _id: id },
     submissionValues
  );
  return result.matchedCount > 0;
}


//NEW DELETE a submission
exports.deleteSubmissionByID = async function deleteSubmissionByID(id) {
   const db = getDBReference();
   const collection = db.collection('submissions');
    const result = await collection.deleteOne({
    //_id: new ObjectID(id)
	_id:id
  });
  console.log(result.deletedCount)
  return result.deletedCount > 0;
}
