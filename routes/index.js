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
            // Attach all needed properties to res.locals
            res.locals.pets = results.docs;
            res.locals.pageCount = results.pages;
            res.locals.currentPage = currentPage;
            res.locals.PUBLIC_STRIPE_API_KEY = process.env.PUBLIC_STRIPE_API_KEY; 
            
            // Render the page
            res.render('pets-index', res.locals);
        });
});

module.exports = router;
