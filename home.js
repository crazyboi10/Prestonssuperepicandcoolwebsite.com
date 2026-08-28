const links = document.querySelectorAll('.links a');

links.forEach((link, index) => {
    link.style.setProperty('--delay', `${index * 70}ms`);
    link.classList.add('show-link');
});
