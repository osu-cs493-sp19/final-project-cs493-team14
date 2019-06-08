/*
 * API sub-router for Course collection endpoints.
 */

const router = require('express').Router();

const { validateAgainstSchema, validateFieldsForPatch } = require('../lib/validation');
/*const { generateAuthToken, requireAuthentication } = require('../lib/auth');
*/
const {
  CourseSchema,
  getAllCourses,
  getCourseById,
  insertNewCourse,
  deleteCourseById
} = require('../models/course');

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
    // coursesPage.links = {};
    // if (coursesPage.page < coursesPage.totalPages) {
    //   coursesPage.links.nextPage = `/courses?page=${coursesPage.page + 1}`;
    //   coursesPage.links.lastPage = `/courses?page=${coursesPage.totalPages}`;
    // }
    // if (coursesPage.page > 1) {
    //   coursesPage.links.prevPage = `/courses?page=${coursesPage.page - 1}`;
    //   coursesPage.links.firstPage = '/courses?page=1';
    // }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching Course list.  Please try again later."
    });
  }
});

/*
 * Route to create a new courses.
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, CourseSchema)) {
    const userid = 1;
    if(userid == 1){
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
 * Route to create new course 
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, CourseSchema)) {
    // const userid = await ;
    const userid = 1;
    if(userid == 1){
      try {
        const id = await insertNewCourse(req.body);
        res.status(201).send({
          id: id
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
      error: "The request body was either not present or did not contain a valid Course object."
    });
  }
});

/*
 * Route to delete a specific Course from the database.
 */
router.delete('/:id',  async (req, res, next) => {
  // const userid = await ;
  const userid =  1;
  if(userid == 1 ){
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
module.exports = router;