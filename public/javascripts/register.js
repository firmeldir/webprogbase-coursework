/* eslint-disable no-unused-vars */
"use strict";

function register(form) {

    fetch("/templates/error.mst").then(x => x.text())
        .then((template) => {

            let login = document.forms["registerForm"]["login"].value;
            let fullname = document.forms["registerForm"]["fullname"].value;
            let password1 = document.forms["registerForm"]["pass"].value;
            let password2 = document.forms["registerForm"]["pass2"].value;

            // eslint-disable-next-line eqeqeq
            if (login == "") {
                renderRegister("Please enter your login", template);
                return;
            }

            // eslint-disable-next-line eqeqeq
            if (fullname == "") {
                renderRegister("Please enter your fullname", template);
                return;
            }

            // eslint-disable-next-line eqeqeq
            if (password1 == "") {
                renderRegister("Please enter your password1", template);
                return;
            }

            // eslint-disable-next-line eqeqeq
            if (password2 == "") {
                renderRegister("Please enter your password2", template);
                return;
            }

            if (password2 !== password1) {
                const par = "Passwords do not match";
                renderRegister(par, template);
                return;
            }

            return Promise.all([template, fetch("/api/v1/unique/" + login, {
                method: 'GET',
            })]);
        })
        .then(([template, x]) => {
            return Promise.all([template, x.json()]);
        })
        .then(([template, json]) => {

            if (json.message === "Unique") {
                renderRegister("", template);
                form.submit();
            } else {
                renderRegister("User already exist!", template);
                return;
            }

        })
        .catch(err => { console.log(err); });

        //todo solve problem
};


function renderRegister(error, template) {

    let errorData = ('tasks', {
        error: error,
    });

    // eslint-disable-next-line no-undef
    const renderedHtmlStr = Mustache.render(template, errorData);

    const clip = document.getElementById('errorConteiner');
    clip.innerHTML = renderedHtmlStr;
}