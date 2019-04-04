const express = require('express');
const router = express.Router();
const userdata = require('../../userdata');
const bluebird = require('bluebird');
const redis = require('redis');
const client = redis.createClient();
const key = 'history';

bluebird.promisifyAll(redis.RedisClient.prototype);

router.get('/history', async(req, res) => {
    try {
        const history = await client.lrangeAsync(key, 0, 19);
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

module.exports = router;

