if (document.getElementById('new-pet')) {
    document.getElementById('new-pet').addEventListener('submit', (e) => {
        e.preventDefault();

        // construct empty pet object and get all user inputs
        const pet = {};
        const inputs = document.querySelectorAll('.form-control');

        // Pair all keys with their values
        for (const input of inputs) {
            pet[input.name] = input.value;
        }

        axios
            .post('/pets', pet)
            .then((response) => {
                console.log(response)
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
    })
}
