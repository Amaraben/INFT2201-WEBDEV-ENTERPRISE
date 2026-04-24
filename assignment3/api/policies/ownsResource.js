// For the mail API, the resource will be req.mail.
// Returns true if mail.userId === user.userId.

module.exports = function ownsResource(user, mail) {
  // TODO: implement
  return user && mail && mail.userId === user.userId;
};