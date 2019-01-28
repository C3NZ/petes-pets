const express = require('express');
const Pet = require('../models/pet');

const router = express.Router();

// NEW PET
router.get('/new', (req, res) => {
    res.render('pets-new');
});

router.get('/search', (req, res, next) => {
    const term = new RegExp(req.query.term, 'i');
    // Allow users to search for both dog name and species
    const currentPage = req.query.page || 1;

    Pet
        .paginate(
            { $or: [{ name: term }, { species: term }] },
            { page: currentPage },
        )
        .then((results) => {
            res.render('pets-index', {
                pets: results.docs,
                pageCount: results.pages,
                currentPage,
                term: req.query.term,
            });
        })
        .catch(err => next(err));
});

// CREATE PET
router.post('/', (req, res, next) => {
    const pet = new Pet(req.body);

    pet
        .save()
        .then((newPet) => {
            // eslint-disable-next-line
            res.json({pet: newPet})
        })
        .catch((err) => {
            return next(err);
        });
});

// SHOW PET
router.get('/:id', (req, res) => {
    Pet
        .findById(req.params.id)
        .exec((err, pet) => {
            res.render('pets-show', { pet });
        });
});

// EDIT PET
router.get('/:id/edit', (req, res) => {
    Pet
        .findById(req.params.id)
        .exec((err, pet) => {
            res.render('pets-edit', { pet });
        });
});

// UPDATE PET
router.put('/:id', (req, res) => {
    Pet
        .findByIdAndUpdate(req.params.id, req.body)
        .then((pet) => {
            return res.redirect(`/pets/${pet._id}`)
        })
        .catch((err) => {
        // Handle Errors
        });
});

// DELETE PET
router.delete('/:id', (req, res) => {
    Pet
        .findByIdAndRemove(req.params.id)
        .exec((err, pet) => {
            return res.redirect('/')
        });
});

module.exports = router;
