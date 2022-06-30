const router = require(`express`).Router();


router.get(`/`, (req, res, next) => {
  try {
    res.status(200).json({
      message: `Welcome to Evently (NOT MEETUP) 😁`,
      apiGithubRepo: `https://github.com/haroun-b/evently`
    });
  } catch (err) {
    next(err);
  }
});


module.exports = router;