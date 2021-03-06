const form = document.getElementById('new-pet') || document.getElementById('edit-pet');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // construct empty pet object and get all user inputs
        const pet = new FormData(form);
        const requestHeaders = {
            'Content-Type': 'multipart/form-data',
        }
        console.log(pet)
        if (form.id === 'new-pet') {
            axios
                .post('/pets', pet, requestHeaders)
                .then((response) => {
                    // Send the user to the new pet page
                    window.location.replace(`/pets/${response.data.pet._id}`);
                })
                .catch((error) => {
                    // Let the user that something has gone wrong during 
                    // the creation of a new pet
                    const alert = document.getElementById('alert');
                    alert.classList.add('alert-warning');
                    alert.textContent = 'Oops, something went wrong saving your pet. Please check your information and try again';
                    alert.style.display = 'block';
                    
                    // Set the alert message to disappear after 3 seconds
                    window.setTimeout(() => {
                        alert.classList.remove('alert-warning');
                        alert.style.display = 'none';
                    }, 3000);
                });
        } else {
            axios
                .put(`/pets/${pet.get('_id')}`, pet, requestHeaders)
                .then((response) => {
                    console.log(response.data)
                    window.location.replace(`/pets/${response.data.pet._id}`);
                })
                .catch((error) => {
                    // Let the user that something has gone wrong during 
                    // the creation of a new pet
                    const alert = document.getElementById('alert');
                    alert.classList.add('alert-warning');
                    alert.textContent = 'Oops, something went wrong saving your pet. Please check your information and try again';
                    alert.style.display = 'block';
        
                    // Set the alert message to disappear after 3 seconds
                    window.setTimeout(() => {
                        alert.classList.remove('alert-warning');
                        alert.style.display = 'none';
                    }, 3000);
                });
        }
    })
}
