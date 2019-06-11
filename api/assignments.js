const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { getUserById, getUserByEmail, validateUser, checkUserisAdmin } = require('../models/user');
const { getCoursesByInstructorId, getCourseById } = require('../models/course');

const { assignmentSchema, getAssignmentsPage, getDownloadStreamById, getDownloadStreamByFilename, insertNewAssignment, 
  deleteAssignmentByID, updateAssignmentByID, getAssignmentByID, saveSubmissionFile, 
  getSubmissionInfoByAssignmentId, getSubmissionDetailsById} = require('../models/assignment')

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */

 const fileTypes = {
  'application/msword': 'doc',
  'txt/*': 'txt'
};
const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}`,
    filename: (req, file, callback) => {
      const basename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = fileTypes[file.mimetype];
      callback(null, `${basename}.${extension}`);
    }
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!fileTypes[file.mimetype])
  }
});
 
 function removeUploadedFile(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file.path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

}

 router.post('/:id/submissions', upload.single('file'), requireAuthentication, async (req, res, next) => {
  console.log("== req.file:", req.file);
  console.log("== req.body:", req.body);
  var currUser = await getUserById(req.user, false)
  if( currUser.role == "student"){
  if (req.file && req.body) {
    try {
		var submissionTime = Math.round(+new Date()/1000)
      const submission = {
        path: req.file.path,
        filename: req.file.filename,
        contentType: req.file.mimetype,
        studentid: req.user,
        timestamp: submissionTime,
	      assignmentid: req.params.id	
      };
      const id = await saveSubmissionFile(submission);
      await removeUploadedFile(req.file);
    
      console.log("submission id: ", id);
      res.status(200).send({ id: id });
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).send({
      err: "Request body was invalid."
    });
  }
  } else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

router.get('/media/submissions/:filename', (req, res, next) => {
  console.log("submissions filename: ", req.params.filename);
  getDownloadStreamByFilename(req.params.filename)
    .on('error', (err) => {
      if (err.code === 'ENOENT') {
        next();
      } else {
        next(err);
      }
    })
    .on('file', (file) => {
      res.status(200).type(file.metadata.contentType);
    })
    .pipe(res);
});

router.get('/:id/submissions', requireAuthentication, async (req, res, next) => {
  var currUser = await getUserById(req.user, false);
	var currAssign = await getAssignmentByID(req.params.id);
	var currCourse = await getCourseById(currAssign.courseId);
  var currCourse = await getCourseById(req.body.courseId);
	if ((currUser.role == "instructor" && currUser._id.toString() == currCourse.instructorId) || currUser.role == "admin") {
    try {
      if (req.query.page) {
        const coursesPage = await getSubmissionDetailsById(req.params.id, 1 , req.query.page);
        res.status(200).send(coursesPage);
      } else if (req.query.subject) {
        const coursesSubject = await getSubmissionDetailsById(req.params.id, 2, req.query.studentId);
        res.status(200).send(coursesSubject);
      } else {  
        const submission = await getSubmissionDetailsById(req.params.id, 0, 0);
        if (submission) {
          // const responseBody = {
          //   _id: submission._id,
          //   url: `/assignments/media/submissions/${submission.filename}`,
          //   contentType: submission.metadata.contentType,
          //   studentid: submission.metadata.studentid,
          //   timestamp: submission.metadata.submissionTime,
          //   assignmentid: submission.metadata.assignmentid
          // };
        console.log("submission: ", submission);
        res.status(200).send(submission);
        } else {
          next();
        }
      }
    } catch (err) {
      next(err);
    }
  }
});
  
 
 
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

