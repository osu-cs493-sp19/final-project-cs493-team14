const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { getUserById, getUserByEmail, validateUser, checkUserisAdmin } = require('../models/user');
const { getCoursesByInstructorId, getCourseById } = require('../models/course');

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
router.post('/',  requireAuthentication, async(req, res) => {
	console.log(req.user)
	var currUser = await getUserById(req.user, false)
	console.log(currUser)
	var currCourse = await getCourseById(req.body.courseId)
	if ((currUser.role == "instructor" && currUser._id.toString() == currCourse.instructorId) || currUser.role == "admin") {
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
} else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

//PUT photos
router.put('/:id', requireAuthentication, async (req, res, next) => {
	console.log(req.user)
	var currUser = await getUserById(req.user, false)
	console.log(currUser)
	var currCourse = await getCourseById(req.body.courseId)
	if ((currUser.role == "instructor" && currUser._id.toString() == currCourse.instructorId) || currUser.role == "admin") {
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
} else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

router.get('/:id', async (req, res) => {
try {
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


router.delete('/:id', requireAuthentication, async(req, res, next) => {
	console.log(req.user)
	var currUser = await getUserById(req.user, false)
	console.log(currUser)
	var currAssign = await getAssignmentByID(req.params.id)
	console.log("curr Assign")
	console.log(currAssign)
	var currCourse = await getCourseById(currAssign.courseId)
	if ((currUser.role == "instructor" && currUser._id.toString() == currCourse.instructorId) || currUser.role == "admin") {
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
} else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

module.exports = router;

