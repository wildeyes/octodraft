const dark = '#1580ff';
const light = '#3790F9';
const SAVE_DRAFT = 'Save Draft';

const TITLE_SEL = 'input[name="issue[title]"]';
const BODY_SEL = 'textarea[name="issue[body]"]';
let drafts = new Drafts();

main();
console.log('Setting up OctroDraft...')
chrome.runtime.onMessage.addListener(function(res) {
    if(res.msg === 'HISTORY_CHANGED')
        setTimeout(main, 100); // wait for DOM Loaded.
});

function main() {
	'use strict';
  
  if(location.href.includes('issues/new')) {
      loadExistingIssueIfExists();
      showDraftButton();
  }
}

function loadExistingIssueIfExists() {
    const issue = drafts.get(getRepoFromURL());
    if(issue) {
        if(issue.title) document.querySelector(TITLE_SEL).value = issue.title;
        if(issue.body) document.querySelector(BODY_SEL).value = issue.body;
    }
}
function showDraftButton() {
    if(document.querySelector('.octodraft')) return;
    const container = document.querySelector('.form-actions ');
    const template =  ele('div', SAVE_DRAFT, ['btn', 'octodraft'], {}, { color: 'white' });
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
function ele(type, innerHTML, classNames, attrs, style) {
    const element = document.createElement(type);
    element.innerHTML = innerHTML;
    if(typeof classNames === 'string') classNames = [classNames]
    classNames.forEach(className => element.classList.add(className));
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
