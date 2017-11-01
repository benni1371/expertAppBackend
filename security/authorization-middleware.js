module.exports = function HasRole(roleArray) {
    return function(req, res, next) {
        if(roleArray.indexOf(req.user.role)!=-1){
            next();
        } else {
            res.status(401).json({ message: 'Not authorized.' });
        }
    }
}