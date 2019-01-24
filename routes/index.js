const express = require('express');
const Pet = require('../models/pet');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    // Retrieve all pets 
    Pet
        .find()
        .exec((err, pets) => {
            res.render('pets-index', { pets: pets });    
        });
});

module.exports = router;
