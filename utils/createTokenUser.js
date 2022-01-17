// creates a token user so that the jwt authentication can be added to that user and cookies generated for that user
const createTokenUser = (user) => {
  return {name: user.name, userId: user._id, role: user.role};
};

export default createTokenUser;
