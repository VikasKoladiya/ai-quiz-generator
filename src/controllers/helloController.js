// Controller for the hello world endpoint
const helloWorld = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello World!",
    user: {
      id: req.user.id,
      username: req.user.username,
    },
  });
};

module.exports = {
  helloWorld,
};
