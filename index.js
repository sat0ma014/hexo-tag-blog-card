'use strict';
const util = require('hexo-util');
const ogs = require('open-graph-scraper');
const escapeHTML = require('escape-html');
const url = require('url');
const descriptionLength = (hexo.config.blogCard && hexo.config.blogCard.descriptionLength)
  ? hexo.config.blogCard.descriptionLength : 140;
const className = (hexo.config.blogCard && hexo.config.blogCard.className)
  ? hexo.config.blogCard.className : 'blog-card';
const faviconAPI = (hexo.config.blogCard && hexo.config.blogCard.faviconAPI)
  ? hexo.config.blogCard.faviconAPI : 'http://favicon.hatena.ne.jp/?url=$URL';
const useHatena = (hexo.config.blogCard && hexo.config.blogCard.useHatena)
  ? hexo.config.blogCard.useHatena : false;
const timeout = (hexo.config.blogCard && hexo.config.blogCard.timeout)
  ? hexo.config.blogCard.timeout : 4000;

hexo.extend.tag.register('blogCard', function(args) {
  return getTag(parseOption(args));
}, { async: true });


function parseOption(args) {
  let opts = { url: args[0], timeout };

  if (args.length > 1) {
    args.slice(1).forEach((e) => {
      let [name, val] = e.split(':');
      if (name == 'target' || name == 'rel' || name == 'hatena') {
        opts[name] = val;
      }
    });
  }
  return opts;
}

function getTag(options) {
  if (options.hatena) {
    if (options.hatena == 'true') {
      return getTagByHatena(options);
    } else if (options.hatena == 'false') {
      return getTagByOpenGraph(options);
    }
  } else if (useHatena) {
    return getTagByHatena(options);
  } else {
    return getTagByOpenGraph(options);
  }
}
function getImage(options,ogp){
const bc_4    = util.htmlTag('img', { class: "bc-4", src:ogp.ogImage.url},'');
const bc_3    = util.htmlTag('a',   { class: "bc-3",href:options.url }, bc_4);
return util.htmlTag('div', { class: "bc-2"},bc_3);
}

function getTitle(options, ogp) {
  const title = util.htmlTag('a', {class: 'bc-5', href: options.url, rel: options.rel }, escapeHTML(ogp.ogTitle));
  return util.htmlTag('p', { style: 'margin:0;' }, title);
}

function getDescription(options, ogp) {
if (ogp.hasOwnProperty('ogDescription')) {
  const bc_6 = util.htmlTag('p',   { class: 'bc-6'},
    escapeHTML(adjustLength(ogp.ogDescription))
  );
  return bc_6;
}
return '';
}

function getInfo(options, ogp) {
  let name = '';
  const urlParsed = url.parse(options.url);

  if (ogp.hasOwnProperty('ogSiteName')) {
    name = ogp.ogSiteName;
  } else {
    name = urlParsed.hostname;
  }

  const siteName = util.htmlTag('div', { class: 'hbc-site-name' }, escapeHTML(name));

  let api = faviconAPI.replace('$DOMAIN', encodeURIComponent(urlParsed.hostname));
  api = api.replace('$URL', encodeURIComponent(options.url));
const bc_favicon=util.htmlTag('img', { class: 'hbc-favicon', src: api } , '');
const bc_hatebu=util.htmlTag('img', {
  class: 'hbc-hatebu bc-hatebu',
  src: 'http://b.hatena.ne.jp/entry/image/' + encodeURIComponent(options.url)}, '');
const bc_8=util.htmlTag('p', {class:'bc-8'},
  bc_favicon + siteName + bc_hatebu
);
const bc_7=util.htmlTag('div', {class: 'bc-7'}, bc_8);
return bc_7;
}

function getTagByOpenGraph(options){
  return ogs(options)
    .then(function (result) {
      const ogp    = result.data;
      const bc_2   = getImage(options,ogp);//Image
      const title_p= getTitle(options, ogp);//title
      const bc_6   =getDescription(options,ogp);
      const bc_7   =getInfo(options,ogp);
      return util.htmlTag('div',{class:'bc-1'}, bc_2+title_p+bc_6+bc_7);
    })
    .catch(function (error) {
      console.log('error:', error);
      return '';
    });
}
function getTagByHatena(options) {
  return new Promise((resolve) => {
    resolve(`<iframe class="${className}" style="width: 100%; height: 155px; max-width: 500px;" src="https://hatenablog-parts.com/embed?url=${options.url}"></iframe>`);
  })
}


function adjustLength(description) {
  if (description && description.length > descriptionLength) {
    description = description.slice(0, descriptionLength) + '…';
  }
  return description;
}
