const sf = {};

sf.email-container = document.querySelector('.email-container');
sf.form = document.querySelector('.email-container > #singular-form');
sf.trigger = document.querySelector('.email-container > #singular-form > button#trigger');
sf.input = document.querySelector('.email-container>#singular-form>#input-email-container>input');
sf.submitButton = document.querySelector('.email-container > #singular-form > #input-email-container > button');
sf.successMessage = document.querySelector('.email-container > #singular-form > #success');

sf.submitDelay = 1500;

sf.clickHandler = (e) => {
    switch (e.target) {
        case sf.trigger:
            console.log('case trigger');
            sf.email-container.style.width = '37rem'
            e.target.classList.remove('shown');
            sf.input.classList.add('shown');
            sf.submitButton.classList.add('shown');
            sf.input.focus();
            break;
        case sf.submitButton:
            sf.submitForm();
            break;
    }
}

sf.handleInputKeypress = (e) => {
    if (e.keyCode === 13) {
        e.preventDefault();
        sf.submitForm();
    }
}

sf.submitForm = () => {
    sf.input.style.transition = 'all .4s ease';
    sf.submitButton.style.transition = 'all .4s ease';
    sf.input.classList.remove('shown');
    sf.submitButton.classList.remove('shown');
    sf.email-container.style.transition = 'all .4s cubic-bezier(0.47, 0.47, 0.27, 1.20) .4s';
    sf.email-container.style.width = '';
    sf.successMessage.classList.add('shown');
    let submission = setTimeout(() => sf.form.submit(), sf.submitDelay);
}

sf.input.addEventListener('keypress', (e) => sf.handleInputKeypress(e));
document.addEventListener('click', (e) => sf.clickHandler(e));
