const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { getUserById, getUserByEmail, validateUser, checkUserisAdmin } = require('../models/user');
const { getCoursesByInstructorId } = require('../models/course');

const { assignmentSchema, getAssignmentsPage, insertNewAssignment, deleteAssignmentByID, updateAssignmentByID, getAssignmentByID} = require('../models/assignment')

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */

//GET all submissions
router.get('/', async (req, res) => {
  try {
    const assignmentsPage = await getAssignmentsPage(parseInt(req.query.page) || 1);
    res.status(200).send(assignmentsPage);
  } catch (err) {
	  console.log(err);
    res.status(500).send({
      error: "Error fetching assignments.  Try again later."
    });
  }
});

//POST Request for submissions
router.post('/', async(req, res) => {
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
router.put('/:id', async (req, res, next) => {
if (validateAgainstSchema(req.body, assignmentSchema)) {
  try {
    const updateSuccessful = await updateAssignmentByID(req.params.id, req.body);
	console.log(req.params.id);
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

router.get('/:id', async (req, res) => {
try {
console.log("start of the literal thing") 
	const assignment = await getAssignmentByID(req.params.id);
	if (assignment) {
	res.status(200).send(assignment);
	} 
	else {
	next();
	}
} 
catch (err) {
	res.status(500).send({
	error: "Unable to fetch assignment."
	});
}
});


router.delete('/:id', async(req, res, next) => {
	try {
  const deleteSuccessful = await deleteAssignmentByID(req.params.id);
console.log(deleteSuccessful)
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

module.exports = router;

