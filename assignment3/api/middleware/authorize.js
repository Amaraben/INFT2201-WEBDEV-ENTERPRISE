// Generic authorization middleware that accepts a policy function.
// The policy function will receive (user, resource) and must return true/false.

module.exports = function authorize(policy) {
  return (req, res, next) => {
    // TODO: implement:
    // - Read req.user and req.mail (or other resource, depending on route).
    const user = req.user;
    const resource = req.mail;

    // - If policy(user, resource) === true, call next().
    if (policy(user, resource)) {
      return next();
    }

    // - Otherwise, create an appropriate "Forbidden" error and pass to next(err).
    const err = new Error ("Forbiddeen: permission denied");
    err.statusCode = 403;
    err.name = "ForbiddenError";

    next(err);
  };
};