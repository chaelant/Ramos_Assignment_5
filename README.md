# CS-554 Assignment 5

Practicing usage of Redis and `async/await` by promisifying the Redis client with Bluebird.

---
With `redis-server` running, utilize the dummy data in `userdata.js` to create an Express API that has two routes: 

* `/api/people/history`
    * Route responds with an array of the last 20 users in the cache, **allowing** duplicates

* `/api/people/:id`
    * Route does two things:
        * Checks to see if the requested user is in the cache. If so, render from there
        * Otherwise, call the `getById(id)` function from the data module and render fresh data
    * Regardless of where the user is rendered from, add them to the cache


### `userdata.js`

This is a data module that exports an array of users and the `getById(id)` function. `getById` emulates
a long-running process to contrast with rendering from the cache.
