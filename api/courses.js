/*
 * API sub-router for Course collection endpoints.
 */

const router = require('express').Router();

const { validateAgainstSchema, extractValidFields  } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { checkUserisAdmin } = require('../models/user');
const {
  CourseSchema,
  //CourseSchemaForPatch,
  getAllCourses,
  getCourseById,
  insertNewCourse,
  updateCourseById,
  deleteCourseById,
  getAssignmentsByCourseId,
  getRosterByCourseId,
  getStudentsByCourseId,
  updateEnrollmentByCourseId,
  removeEnrollmentByCourseId,
  saveCSVFile,
  getDownloadStreamByFilename
} = require('../models/course');
var fs = require('fs');

/*
 * Route to return a paginated list of Course.
 */
router.get('/', async (req, res) => {
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    if (req.query.page) {
      const coursesPage = await getAllCourses(1 , req.query.page);
      res.status(200).send(coursesPage);
    } else if (req.query.subject) {
      const coursesSubject = await getAllCourses(2 , req.query.subject);
      res.status(200).send(coursesSubject);
    } else if (req.query.number) {
      const coursesNumber = await getAllCourses(3 , req.query.number);
      res.status(200).send(coursesNumber);
    } else if (req.query.term) {
      const coursesTerm = await getAllCourses(4 , req.query.term);
      res.status(200).send(coursesTerm);
    } else {
      const coursesAll = await getAllCourses(0 , 0);
      res.status(200).send(coursesAll);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching Course list.  Please try again later."
    });
  }
});

/*
 *Route to Creates a new Courses with specified data and adds it to the application's database. 
 *Only an authenticated User with 'admin' role can create a new Course
 */
router.post('/',requireAuthentication , async (req, res, next) => {
  if (validateAgainstSchema(req.body, CourseSchema)) {
    const isAdmin = await checkUserisAdmin(req.user);
    if (isAdmin == 2) {
      try {
        const id = await insertNewCourse(req.body);
        res.status(201).send({
          id: id,
          links: {
            course: `/courses/${id}`
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting course into DB.  Please try again later."
        });
      }
    } else {
      res.status(403).send({
        error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid course object."
    });
  }
});

/*
 * Route to fetch info about a specific Course.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const course = await getCourseById(req.params.id);
    if (course) {
      res.status(200).send(course);
    } else {
      res.status(404).send({
        error: "Specified Course `id` not found."
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch course.  Please try again later."
    });
  }
});

/*
 * Route to delete a specific Course from the database.
 */
router.delete('/:id', requireAuthentication,  async (req, res, next) => {
  const isAdmin = await checkUserisAdmin(req.user);
  if (isAdmin == 2) {
    try {
      const deleteSuccessful = await deleteCourseById(req.params.id);
      if (deleteSuccessful) {
        console.log("Delete successful");
        res.status(204).end();
      } else {
        res.status(404).send({
          error: "Specified Course `id` not found."
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch course.  Please try again later."
      });
    }
  } else {
     res.status(403).send({
       error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
     });
   }
});

router.patch('/:id', requireAuthentication, async (req, res, next) => {
  validFieldsBody = extractValidFields(req.body, CourseSchema); 
  console.log("validFieldsBody ", validFieldsBody);
  if (validFieldsBody != null) {
    const isAdmin = await checkUserisAdmin(req.user);
    const course = await getCourseById(req.params.id);
    if ((isAdmin == 2) || (isAdmin == 1 && course.instructorId == req.user)) {
      try {
        const updateSuccessful = await updateCourseById(req.params.id, validFieldsBody);
        console.log(req.params.id);
        console.log(updateSuccessful)
        if (updateSuccessful) {
          res.status(200).send({});
        } 
        else {
          res.status(404).send({
            err: "Course Id was not found."
          });
        }
      } catch (err) {
        console.log("Error: ", err);
        res.status(500).send({
          error: "Unable to update assignment."
        });
      }
    } else {
      res.status(403).send({
        error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
      });
    } 
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid course."
    });
  }
});

/*
 * Route to fetch a list of students enrolled in a given course by its id.
 */
router.get('/:id/students', requireAuthentication, async (req, res) => {
  const isAdmin = await checkUserisAdmin(req.user);
  const course = await getCourseById(req.params.id);
  if (course != null) {
    console.log("isAdmin: ", isAdmin);
    if ((isAdmin == 2) || (isAdmin == 1 && course.instructorId == req.user)) {
      try {
        const studentList = await getStudentsByCourseId(req.params.id);
        res.status(200).send(studentList);
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to fetch enrolled students."
        });
      }
    } else {
      res.status(403).send({
            error: "Unauthorized to view resource."
      });
    }
  } else {
    res.status(404).send({
      error: "Specified course not found."
    });
  }
});


/*
 * Route to create a new enrolled students.
 */
router.post('/:id/students', requireAuthentication, async (req, res, next) => {
  if (req.body.students) {
    const isAdmin = await checkUserisAdmin(req.user);
    const course = await getCourseById(req.params.id);
    if (course != null) {
      if ((isAdmin == 2) || (isAdmin == 1 && course.instructorId == req.user)) {
        try {
          const id = await updateEnrollmentByCourseId(req.params.id, req.body);
          res.status(200).send({
            id: id,
            links: {
              course: `/courses/${id}/students`
            }
          });
        } catch (err) {
          console.error(err);
          res.status(500).send({
            error: "Error inserting course into DB.  Please try again later."
          });
        }
      } else {
        res.status(403).send({
          error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid course object."
      });
    }
  }
  else {
    res.status(404).send({
      error: "Specified course not found."
    });
  }
});

router.delete('/:id/students', requireAuthentication, async (req, res, next) => {
  const isAdmin = await checkUserisAdmin(req.user);
  const course = await getCourseById(req.params.id);
  if (course != null) {
    if ((isAdmin == 2) || (isAdmin == 1 && course.instructorId == req.user)) {
      try {
        const id = await removeEnrollmentByCourseId(req.params.id, req.body);
        res.status(200).send({
          id: id,
          links: {
            course: `/courses/${id}/students`
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting course into DB.  Please try again later."
        });
      }
    } else {
      res.status(403).send({
        error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid course object."
    });
  }
});

router.get('/:id/roster',  requireAuthentication, async (req, res, next) => {
  const isAdmin = await checkUserisAdmin(req.user);
  const course = await getCourseById(req.params.id);
  if (course != null) {
    if ((isAdmin == 2) || (isAdmin == 1 && course.instructorId == req.user)) {
      try {
        console.log("hi students");
        const roster = await getRosterByCourseId(req.params.id);
        if (roster) {
          fs.writeFile("/usr/src/app/api/studentRoster.csv", roster, function(error) {
            if (error) {
              console.error("write error:  " + error.message);
            } else {
              console.log("Successful Write to ");
            }
          });
          const csvFile = {
            path: "/usr/src/app/api/studentRoster.csv",
            contentType: "text/csv",
            filename: "studentRoster.csv"
          };
          await saveCSVFile(csvFile);
          const responseBody = {
            url: `/courses/media/files/studentRoster.csv`
          }
          res.status(200).send(responseBody);
        } else {
          next();
        }
      } catch (err) {
        console.log("error: ", err);
        res.status(500).send({
          error: "Unable to fetch roster."
        });
       }
      }
      else {
        res.status(403).send({
              error: "Unauthorized to access resource."
        });
      }
    } else {
      res.status(404).send({
        error: "error",
        error: `Specified course not found.`
      });
    }
  });

router.get('/media/files/:filename', (req, res, next) => {
  console.log("csv filename: ", req.params.filename);
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

router.get('/:id/assignments', async (req, res, next) => {
  try {
    console.log("hi assign");
    const assignments = await getAssignmentsByCourseId(req.params.id);
    if (assignments) {
      res.status(200).send(assignments);
    } else {
      next();
    }
  } catch (err) {
    console.log("error: ", err);
    res.status(500).send({
      error: "Unable to fetch assignment."
    });
  }
});

module.exports = router;