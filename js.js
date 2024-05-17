
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry)
        if (entry.isIntersecting) {
            entry.target.classList.add('show')            
        } else {
            entry.target.classList.remove('show');
        }
    });
});

const hiddenElements = document.querySelectorAll('.hidden'); 
hiddenElements.forEach((el) => observer.observe(el));



 // Function to check server status
 function checkServerStatus() {
    var url = 'facebook.com'; // Replace this with your server URL
    var statusDiv = document.getElementById('status');

    // Send an HTTP GET request to the server
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                statusDiv.innerText = 'Server is up';
            } else {
                statusDiv.innerText = 'Server is down';
            }
        }
    };
    xhr.send();
}

// Call the function to check server status when the page loads
window.onload = function () {
    checkServerStatus();
};
