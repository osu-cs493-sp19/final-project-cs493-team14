const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { AssignmentSchema, insertNewAssignment, getAssignmentById } = require('../models/assignment');
const { getUserById, getUserByEmail, validateUser, checkUserisAdmin } = require('../models/user');
const { getCoursesByInstructorId } = require('../models/course');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');

module.exports = router;
