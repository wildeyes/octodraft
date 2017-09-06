chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		main();
		window.popstate = main;
	}}, 10);
});

const dark = '#1580ff';
const light = '#3790F9';
const SAVE_DRAFT = 'Save Draft';

const TITLE_SEL = 'input[name="issue[title]"]';
const BODY_SEL = 'textarea[name="issue[body]"]';
let drafts = new Drafts();

function main() {
	'use strict';
	console.log('Setting up OctroDraft...')
  if(location.href.includes('issues/new')) {
      loadExistingIssueIfExists();
      showDraftButton();
  }
}

function loadExistingIssueIfExists() {
    const issue = drafts.get(getRepoFromURL());
    if(issue) {
        document.querySelector(TITLE_SEL).value = issue.title;
        document.querySelector(BODY_SEL).value = issue.body;
    }
}
function showDraftButton() {
    const container = document.querySelector('.form-actions ');
    const template =  ele('div', SAVE_DRAFT, 'btn', {}, { color: 'white' });
    //TODO add mutation observer so that save draft button will be disabled and non disabled whenever submit issue is.
    template.innerHTML = SAVE_DRAFT;
    template.style.backgroundColor = dark;
    template.style.backgroundImage = `linear-gradient(-180deg, ${light} 0%, ${dark} 90%)`;
    //template.style.float = 'right';
    //template.style.margin = '0 8px';
    template.addEventListener('click', e => {
        e.stopPropagation();

        const issue = {
            repo: getRepoFromURL(),
            title: document.querySelector(TITLE_SEL).value,
            body: document.querySelector(BODY_SEL).value,
        };

        drafts.set(issue);

        // give feedback to user
        setTimeout(() => template.innerHTML = 'Saved!', 70);
        setTimeout(() => template.innerHTML = SAVE_DRAFT, 900);

        return false;
    });

    container.appendChild(template);
}
function showDraftsInNotifications() {

    const template = getRepoTemplate();

    const container = ele('div', `<h1>Drafts</h1>` + template.innerHTML, 'boxed-group', {}, {
        width: '980px',
        margin: '0 auto',
        padding: '7px 15px',
        'border-top': '1px solid #d1d5da',
        'border-bottom': '1px #e1e4e8 solid',
    });

    document.getElementById('js-pjax-container').appendChild(container);
}
function getRepoTemplate(title, issues) {
    const template = document.querySelector('.boxed-group.js-notifications-browser').cloneNode(true);

    template.removeChild(template.querySelector('form'));

    return template;
}
function getIssueTemplate(id, title, date, link) {
    const template = document.querySelector('li.list-group-item').cloneNode(true);

    const title = template.querySelector('a')
    a.innerHTML = title;
    a.href = link;

    template.removeChild(template.querySelector('.age')); // TODO put date here.
    template.removeChild(template.querySelector('.tooltipped'));
    template.removeChild(template.querySelector('.mute'));

    template.querySelector('.delete').addEventListener('click', _ => drafts.delete(id));

    return template
}
function ele(type, innerHTML, className, attrs, style) {
    const element = document.createElement(type);
    element.innerHTML = innerHTML;
    element.classList.add(className);
    Object.keys(attrs).forEach(a => element[a] = attrs[a]);
    Object.keys(style).forEach(s => element.style[s] = style[s]);
    return element;
};
function getRepoFromURL() {
    return location.href.replace('/issues/new', '').split('/').slice(-2).join('/');
}
// TODO add logging because why not
function Drafts() {
    const lsKey = 'octodraft';
    try {
        this._data = JSON.parse(localStorage.getItem(lsKey)) || {};
    } catch(e) {
        this._data = {};
    }

    this.set = (issue) => {
        this._data[issue.repo] = issue;
        this._save();
    };
    this.get = (repo) => {
        return this._data[repo];
    };
    this._save = () => localStorage.setItem(lsKey, JSON.stringify(this._data));
}