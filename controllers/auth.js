const User = require('../models/user');

exports.signup = function(req, res, next){

    res.status(200).json({"message": "signedin"});
};

exports.getAllUsers = async(req, res) => {
    const { data, error } = await User.fetchAll();
    console.log(data)

    res.status(200).json({"data": "nothing"});
};
