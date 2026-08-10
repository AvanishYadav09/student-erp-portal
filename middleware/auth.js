const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        return next();
    }
    return res.redirect("/");
};

const requireAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    return res.status(403).send("Forbidden: Administrative Access Required. Students have read-only privileges.");
};

module.exports = { requireAuth, requireAdmin };
