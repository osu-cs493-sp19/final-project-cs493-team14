/*
 * API routes for 'users' collection.
 */

const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { UserSchema, insertNewUser, getUserById, getUserByEmail, validateUser, checkUserisAdmin } = require('../models/user');
const { getCoursesByInstructorId } = require('../models/course');

router.post('/', requireAuthentication, async (req, res) => {
  console.log("req user: ", req.user);
  const checkUser = await checkUserisAdmin(req.user);
  if (validateAgainstSchema(req.body, UserSchema)) {
    try {
      if(req.body.admin == "admin" && checkUser[0].admin == 0){
        res.status(403).send({
          error: "Only admin can add user with admin privillages"
        });
      } else if(req.body.admin == "teacher" && checkUser[0].admin == 0){
        res.status(403).send({
          error: "Only admin can add user with teacher privillages"
        });
      } else {
        const id = await insertNewUser(req.body);
        console.log("newUser _id: ", id);
        res.status(201).send({
          _id: id
        });
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error inserting new user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body does not contain a valid User."
    });
  }
});

router.post('/login', async (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      const authenticated = await validateUser(req.body.email, req.body.password);
      if (authenticated) {
        const user = await getUserByEmail(req.body.email);
        const token = generateAuthToken(user._id);
        console.log("_id: ", user);
        console.log("auth token: ", token);
        res.status(200).send({
          token: token
        });
      } else {
        res.status(401).send({
          error: "Invalid credentials"
        });
      }
    } catch (err) {
      res.status(500).send({
        error: "Error validating user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body was invalid"
    });
  }
});

router.get('/:id', requireAuthentication, async (req, res, next) => {
  if (req.params.id === req.user) {
    try {
      console.log("req params id: ", req.params.id);
      const user = await getUserById(req.params.id);
      if (user) {
        if (user.role == "instructor") {
          await getCoursesByInstructorId(req.params.id);
        }
        res.status(200).send(user);
      } else {
        next();
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error fetching user.  Try again later."
      });
    }
  } else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

module.exports = router;