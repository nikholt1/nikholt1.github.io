


const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry)
        if (entry.isIntersecting) {
            entry.target.classList.add('show');  
        } else {
            entry.target.classList.remove('show');
        }
    })
})

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));


function toggleNav() {
    var sidenav = document.getElementById("sidenav");
    if (sidenav.style.left === "-200px") {
      sidenav.style.left = "0";
    } else {
      sidenav.style.left = "-200px";
    }
  }

  function toggleContent() {
    var content = document.querySelector('.content');
    content.classList.toggle('show-skillphone');
    content.classList.toggle('show-skillspline');
}

