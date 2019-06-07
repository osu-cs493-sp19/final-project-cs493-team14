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
const { submissionSchema, getSubmissionsPage, insertNewSubmission, deleteSubmissionByID, updateSubmissionByID, getSubmissionByID, getSubmissionByID } = require('./models/submission')
const submissions = require('./submissions');
//const reviews = require('./reviews');
//const photos = require('./photos');


/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);


//GET all submissions
app.get('/submissions', async (req, res) => {
  try {
    const submissionsPage = await getSubmissionsPage(parseInt(req.query.page) || 1);
    res.status(200).send(submissionsPage);
  } catch (err) {
	  console.log(err);
    res.status(500).send({
      error: "Error fetching submissions.  Try again later."
    });
  }
});

//POST Request for submissions
app.post('/submissions', async(req, res) => {
if (validateAgainstSchema(req.body, submissionSchema)) {
try {
  const id = await insertNewSubmission(req.body);
  res.status(201).send({ id: id });
} 
catch (err) {
res.status(500).send({
  error: "Error inserting submission into DB."
});
}
} 
else {
  res.status(400).send({
    error: "Request body does not contain a valid submission."
  });
}
});

//PUT photos
app.put('/submissions/:id', async (req, res, next) => {
if (validateAgainstSchema(req.body, submissionSchema)) {
  try {
    const updateSuccessful = await updateSubmissionByID(parseInt(req.params.id), req.body);
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
      error: "Unable to update submission."
    });
  }
} 
else {
  res.status(400).send({
    err: "Request body does not contain a valid submission."
  });
}
});

app.delete('/submissions/:id', async(req, res) => {
	try {
  const deleteSuccessful = await deleteSubmissionByID(parseInt(req.params.id));
  if (deleteSuccessful) {
     res.status(204).end();
  } else {
    next();
  }
} catch (err) {
  res.status(500).send({
    error: "Unable to delete submission."
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