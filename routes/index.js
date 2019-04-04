const peopleRoutes = require('./api/people');

const constructorMethod = app => {
    app.use('/api/people', peopleRoutes);
    app.use('*', (req, res) => {
        res.sendStatus(200);
    })
};

module.exports = constructorMethod;
