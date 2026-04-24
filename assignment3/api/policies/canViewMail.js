// Composite policy:
// A user can view mail if:
// - they are an admin OR
// - they own the mail resource.

const isAdmin = require("./isAdmin");
const ownsResource = require("./ownsResource");

module.exports = function canViewMail(user, mail) {
  // TODO: implement using isAdmin and ownsResource
  return isAdmin(user) || ownsResource(user, mail);
};