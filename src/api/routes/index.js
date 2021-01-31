const { Router } = require('express')
const router = Router()
const api = require('../api');

router.get('/search', (req, res) => {
    if (req.query.q) {
        api.search(req.query.q, req.query.page).then(posts => {
            res.status(200).json(posts)
        }).catch((err) => {
            console.log(err);
        });
    } else {
        res.status(400).json({ invalid: 'No query defined' })
    }
})

router.get('/genres/all', (req, res) => {
    api.allGenres().then(genres => {
        res.status(200).json(genres)
    }).catch((err) => {
        console.log(err);
    });
})

router.get('/series/all', (req, res) => {
    api.allSeries().then(series => {
        res.status(200).json(series)
    }).catch((err) => {
        console.log(err);
    });
})


router.get('/series/:id', (req, res) => {
    api.serie(req.params.id).then(posts => {
        if (posts != null) {
            res.status(200).json(posts)
        } else { res.status(404).json({ status: 404, message: `Series not found with id ${req.params.id}` }) }
    }).catch((err) => {
        console.log(err);
    });
})

router.get('/post/latest', (req, res) => {
    api.latest().then(posts => {
        res.status(200).json(posts)
    }).catch((err) => {
        console.log(err);
    });
})

router.get('/post/all', (req, res) => {
    api.allPosts(req.query.page, req.query.orderby, req.query.order).then(posts => {
        res.status(200).json(posts)
    }).catch((err) => {
        console.log(err);
    });
})

router.get('/post/english', (req, res) => {
    api.byLanguage('eng', req.query.page, req.query.orderby, req.query.order).then(posts => {
        res.status(200).json(posts)
    }).catch((err) => {
        console.log(err);
    });
})

router.get('/post/raw', (req, res) => {
    api.byLanguage('raw', req.query.page, req.query.orderby, req.query.order).then(posts => {
        res.status(200).json(posts)
    }).catch((err) => {
        console.log(err);
    });
})

router.get('/post/spanish', (req, res) => {
    api.byLanguage('spa', req.query.page, req.query.orderby, req.query.order).then(posts => {
        res.status(200).json(posts)
    }).catch((err) => {
        console.log(err);
    });
})

router.get('/post/:id', (req, res) => {
    api.episode(req.params.id).then(episode => {
        if (episode != null) {
            res.status(200).json(episode)
        } else { res.status(404).json({ status: 404, message: `Episode not found with id ${req.params.id}` }) }
    }).catch((err) => {
        console.log(err);
    });
})

module.exports = router