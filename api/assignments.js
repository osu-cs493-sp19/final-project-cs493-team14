const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const api = require('./api');
const { connectToDB } = require('./lib/mongo');
const app = express();
const ObjectID = require('mongodb').ObjectID;
const port = process.env.PORT || 8000;

//const MongoClient = require('mongodb').MongoClient;
/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));

const { validateAgainstSchema } = require('./lib/validation');
const { assignmentSchema, getAssignmentsPage, insertNewAssignment, deleteAssignmentByID, updateAssignmentByID, getAssignmentByID} = require('./models/assignment')
const assignments = require('./assignments');
//const reviews = require('./reviews');
//const photos = require('./photos');


/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);


//GET all submissions
app.get('/assignments', async (req, res) => {
  try {
    const submissionsPage = await getAssignmentsPage(parseInt(req.query.page) || 1);
    res.status(200).send(assignmentsPage);
  } catch (err) {
	  console.log(err);
    res.status(500).send({
      error: "Error fetching assignments.  Try again later."
    });
  }
});

//POST Request for submissions
app.post('/assignments', async(req, res) => {
if (validateAgainstSchema(req.body, assignmentSchema)) {
try {
  const id = await insertNewAssignment(req.body);
  res.status(201).send({ id: id });
} 
catch (err) {
res.status(500).send({
  error: "Error inserting assignment into DB."
});
}
} 
else {
  res.status(400).send({
    error: "Request body does not contain a valid assignment."
  });
}
});

//PUT photos
app.put('/assignments/:id', async (req, res, next) => {
if (validateAgainstSchema(req.body, assignmentSchema)) {
  try {
    const updateSuccessful = await updateAssignmentByID(parseInt(req.params.id), req.body);
	console.log("in submissions")
	  console.log(updateSuccessful)
    if (updateSuccessful) {
      res.status(200).send({});
    } 
	else {
      next();
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to update assignment."
    });
  }
} 
else {
  res.status(400).send({
    err: "Request body does not contain a valid assignment."
  });
}
});

app.delete('/assignments/:id', async(req, res) => {
	try {
  const deleteSuccessful = await deleteAssignmentByID(parseInt(req.params.id));
  if (deleteSuccessful) {
     res.status(204).end();
  } else {
    next();
  }
} catch (err) {
  res.status(500).send({
    error: "Unable to delete assignment."
  });
}
});

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

connectToDB(() => {
  app.listen(port, () => {
    console.log("== Server is listening on port:", port);
  });
}); 
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { AssignmentSchema, insertNewAssignment, getAssignmentById } = require('../models/assignment');
const { getUserById, getUserByEmail, validateUser, checkUserisAdmin } = require('../models/user');
const { getCoursesByInstructorId } = require('../models/course');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
