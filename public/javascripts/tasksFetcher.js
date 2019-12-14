/* eslint-disable no-unused-vars */
"use strict";
fetchTasks(1, "");

function fetchTasks(page, searchQuery) {

    if (typeof searchQuery === 'undefined'){
        searchQuery = document.forms["tasksForm"].elements["searchQuery"].value;
    }
    
    fetch("/api/v1/me")
        .then(x => x.json())
        .then((user) => { console.log(user); return user; })
        .then((user) => {

            let headers = new Headers();
            headers.set('Authorization', 'Basic ' + window.btoa(user.login + ":" + user.passwordHash));

            return Promise.all([
                fetch("api/v1/tasks?searchQuery=" + searchQuery + "&limit=4&page=" + page, {
                    method: 'GET',
                    headers: headers
                }).then(x => x.json()),

                fetch("/templates/tasks.mst").then(x => x.text())
            ]);
        })
        .then(([json, template]) => {
            renderTasks(json, template, page, searchQuery);
        })
        .catch(err => { alert(err); });

}


function renderTasks(json, template, page, searchQuery) {

    const tasks = json.tasks;
    const count = json.count;

    let renderData;

    if (tasks.length === 0) {
        renderData = ('tasks', {
          emptySearchText: "We have not find anything for you",
          searchQuery: searchQuery,
          current: 0,
          maximum: count
        });
      } else {
        renderData = ('tasks', {
          tasks: tasks,
          searchQuery: searchQuery,
          current: page,
          maximum: count
        });
      }

    // eslint-disable-next-line no-undef
    const renderedHtmlStr = Mustache.render(template, renderData);

    const clip = document.getElementById('tasksConteiner');
    clip.innerHTML = renderedHtmlStr;
}

function previousPage() {

    let current = parseInt(document.getElementById("current").innerHTML);

    if (current > 1) {
        fetchTasks(current - 1);
    }
};

function nextPage() {

    let current = parseInt(document.getElementById("current").innerHTML);

    let maximum = parseInt(document.getElementById("maximum").innerHTML);

    if (current < maximum) {
        fetchTasks((current + 1));
    }
};

function searchPage() {
    fetchTasks(1);
};