// const HttpError = require("../utils/HttpError");

// const restrictTo = (attachedRoleName) => {
//   return (req, res, next) => {
//     const {roleName} = req.user;
//     if(roleName !== attachedRoleName){
//       throw new HttpError('Access to this web page is forbidden!',403);
//     }
//     next();
//   };
// };

// module.exports = restrictTo;


const HttpError = require("../utils/HttpError");

// Accepts one or more role names
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    const { roleName } = req.user;

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(roleName)) {
      throw new HttpError("Access to this web page is forbidden!", 403);
    }

    next();
  };
};

module.exports = restrictTo;