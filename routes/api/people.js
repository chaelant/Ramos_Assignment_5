const express = require('express');
const router = express.Router();
const userdata = require('../../userdata');
const bluebird = require('bluebird');
const redis = require('redis');
const client = redis.createClient();
const key = 'history';

bluebird.promisifyAll(redis.RedisClient.prototype);

router.get('/history', async(req, res) => {
    /*
    This route will respond with an array of the last 20 users in the cache from the recently viewed list. You can have duplicate users in your 20 user list.
    For each user being printed out, you will print out their entire user information.
     */
    try {
        const history = await client.lrangeAsync(key, 0, 20);
        let users = [];
        for (let user in history) {
            users.push(JSON.parse(history[user]));
        }
        const response = {
            'history': users
        };

        res.send(response);
    } catch (e) {
        console.log(e);
        res.send({error: e});
    }
});

// checks cache
router.get('/:id', async(req, res, next) => {
    let requested;

    if (parseInt(req.params.id)) {
        requested = parseInt(req.params.id)
    } else {
        next()
    }

    const history = await client.lrangeAsync(key, 0, -1);

    const foundInCache = history.filter(elem => {
        let parsedElem = JSON.parse(elem);
        return parsedElem.id === requested;
    })[0];

    if (foundInCache) {
        await client.lpushAsync(key, foundInCache);
        res.send(foundInCache)
    } else {
        next();
    }
});

// if not in cache
router.get('/:id', async(req, res) => {
    /*
    This route will do two things:
    1) Check if the user has a cache entry in redis. If so, render the result from that cache entry
    2) If not, query the data module for the person and fail the request if they are not found, or send JSON and cache the result if they are found.
    If the person is found, then you will add their ID to a list of recently viewed people (this list allows duplicates!) ordered by most recent accessor first. This list can be infinitely large.
     */
    const reqUser = await userdata.getById(req.params.id);

    if (reqUser) {
        try {
            await client.lpushAsync(key, JSON.stringify(reqUser));
            res.send(reqUser)
        } catch (e) {
            console.error(e)
        }
    } else {
        res.send({'message': `User with ID ${req.params.id} does not exist`})
    }
});

// router.get('/list/all', async(req, res) => {
//     res.send(userdata.userList);
// });

module.exports = router;

