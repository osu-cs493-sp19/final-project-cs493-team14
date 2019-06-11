const router = require('express').Router();
const validation = require('../lib/validation');
const { extractValidFields } = require('../lib/validation');
const { getUserById, getUserByEmail, validateUser, checkUserisAdmin } = require('../models/user');
const { getDBReference } = require('../lib/mongo');
const { ObjectId, GridFSBucket } = require('mongodb');
const fs = require('fs');
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

async function getAssignmentByID(id) { 
  const db = getDBReference();
    const collection = db.collection('assignments');
    console.log("in here");
    const results = await collection.find({
      _id: new ObjectId(id)
    //_id:id
    }).toArray();
    return results[0];
}
exports.getAssignmentByID = getAssignmentByID;

function saveSubmissionFile(file) {
  return new Promise((resolve, reject) => {
    const db = getDBReference();
    const bucket = new GridFSBucket(db, { bucketName: 'submissions' });

    const metadata = {
	  contentType: file.contentType,
      studentid: file.studentid,
      timestamp: file.timestamp,
	  assignmentid: file.assignmentid	
    };

    const uploadStream = bucket.openUploadStream(
      file.filename,
      { metadata: metadata }
    );

    fs.createReadStream(file.path)
      .pipe(uploadStream)
      .on('error', (err) => {
        reject(err);
      })
      .on('finish', (result) => {
        resolve(result._id);
      });
  });
};
exports.saveSubmissionFile = saveSubmissionFile;

async function getSubmissionInfoByAssignmentId (id) {
  const db = getDBReference();
  // const collection = db.collection('images');
  const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    console.log("id: ", id);
    const results = await bucket.find({ "metadata.assignmentid": id })
      .toArray();
    console.log("results: ", results);
    return results;
  }
};
exports.getSubmissionInfoByAssignmentId = getSubmissionInfoByAssignmentId;

async function getSubmissionDetailsById(id, type, query) {
	console.log("in get details by id")
  const assignment = await getAssignmentByID(id);
  if (assignment) {
	  console.log("got an assignment")
    assignment.submissions = [];
    arraySubmissions = await getSubmissionInfoByAssignmentId(id);
	console.log("array submissions", arraySubmissions)
    arraySubmissions.forEach(function(submission) {
      const responseBody = {
        _id: submission._id,
        url: `/assignments/media/submissions/${submission.filename}`,
        contentType: submission.metadata.contentType,
        studentid: submission.metadata.studentid,
        timestamp: submission.metadata.submissionTime,
        assignmentid: submission.metadata.assignmentid
      };
      assignment.submissions.push(responseBody);
    }, this); 
  }
  if (type == 1) {
    const count = assignment.submissions.length;
    const pageSize = 1;
    const lastPage = Math.ceil(count / pageSize);
    const page = query-1;
    // page = page < 1 ? 1 : page;
    // page = page > lastPage ? lastPage : page;
    // const offset = (page - 1) * pageSize;

    // const results = await collection.find({})
    //   .sort({ _id: 1 })
    //   .skip(offset)
    //   .limit(pageSize)
    //   .toArray();
    tempArray = [assignment.submissions[page]];
    assignment.submissions = tempArray;

    // return {
    //   assignments: results,
    //   page: page,
    //   totalPages: lastPage,
    //   pageSize: pageSize,
    //   count: count
    // };
  } else if (type == 2) {
    const studentId = query;
    tempArray = assignment.submissions;
    var newArray = [];
    tempArray.forEach(function(submission) {
      if (submission.studentid == studentId) {
        newArray.push(submission);
      }
    }, this);
    assignment.submissions = newArray;
  }
  return assignment;
};
exports.getSubmissionDetailsById = getSubmissionDetailsById;

exports.getDownloadStreamById = function (id) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    return bucket.openDownloadStream(new ObjectId(id));
  }
};

exports.getDownloadStreamByFilename = function (filename) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
  return bucket.openDownloadStreamByName(filename);
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
    { _id: new ObjectId(id) },
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
    _id: new ObjectId(id)
	//_id: id
  });
  console.log(result.deletedCount)
  return result.deletedCount > 0;
}
