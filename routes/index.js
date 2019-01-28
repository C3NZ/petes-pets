const express = require('express');
const Pet = require('../models/pet');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    // Retrieve paginated pets based on the current users page
    const currentPage = req.query.page || 1;

    Pet
        .paginate({}, { page: currentPage })
        .then((results) => {
            res.render('pets-index', { pets: results.docs, pageCount: results.pages, currentPage });
        });
});

module.exports = router;
