const cheerio = require('cheerio')
const axios = require('axios')
const {
    BASE_URL, SEARCH_URL,
    SERIE_URL, SERIES_URL, GENRES_URL,
    EPISODE_URL, POSTS_URL,
    RAW_URL, SPANISH_URL, ENGLISH_URL
} = require('./urls');

function getLanguage(title) {
    const findTerm = (term) => {
        if (title.includes(term)) {
            return title
        }
    }

    switch (title) {
        case findTerm('Doblado'):
            return ['Spanish', 'None']
        case findTerm('Dubbed'):
            return ['English', 'None']
        case findTerm('English'):
            return ['Japanese', 'English']
        case findTerm('Español'):
            return ['Japanese', 'Spanish']
        default:
            return ['Japanese', 'None']
    }
}

function parseViews(number) {
    var base = parseFloat(number)
    if (number.toLowerCase().match(/k/)) {
        return Math.round(base * 1000)
    }
    else if (number.toLowerCase().match(/m/)) {
        return Math.round(base * 1000000)
    } else return parseInt(number)
}

function parsePost($, item) {
    const a = $(item).find('a')
    postTitle = a.attr('title')
    if (postTitle.match(/^.*(AlphaSigma|AΣ).*$/g)) {
        return true
    }
    postId = parseInt(a.attr('data-id'))
    postLink = a.attr('href')
    postSeries = postTitle.replace(/^.*【PV】|(Episode|Episodio).*$/g, '').trim()
    episodeMatch = postTitle.match(/(?<=(Episode|Episodio)\s*)(\d+)/g)
    postEpisode = parseInt(episodeMatch != null ? episodeMatch[0] : null)
    postLanguage = getLanguage(postTitle)
    postType = postTitle.match(/^.{0,4}(PV)/g) == null ? "Episode" : "Preview"
    postThumbnail = $(item).find('img').attr('src')
    postViews = parseViews($(item).find('i.count').html())
    return {
        id: postId,
        series: postSeries,
        episode: postEpisode,
        audio: postLanguage[0],
        subtitles: postLanguage[1],
        type: postType,
        thumbnail: postThumbnail,
        title: postTitle,
        url: postLink,
        views: postViews
    }
}

const latest = async () => {
    const response = await axios.default.get(BASE_URL)
    const $ = cheerio.load(response.data)
    const sections = []
    $('.section-box').each((_, sect) => {
        const posts = []
        $(sect).find('.item').each((_, item) => {
            posts.push(parsePost($, item))
        })
        sections.push(posts)
    })
    console.log(sections[0][0])
    return {
        newest: sections[0],
        english: sections[1],
        spanish: sections[2],
        raw: sections[3],
        preview: sections[4]
    }
}

const search = async (query="", page = 1) => {
    const response = await axios.default.get(`${SEARCH_URL}${page}`, {
        params: {
            s: query
        }
    })
    const $ = cheerio.load(response.data)
    const posts = []
    $('.item').each((_, item) => {
        posts.push(parsePost($, item))
    })
    return posts
}

const serie = async (id) => {
    try {
        const response = await axios.default.get(`${SERIE_URL}${id}`)
        const $ = cheerio.load(response.data)
        const posts = []
        $('.item').each((_, item) => {
            posts.push(parsePost($, item))
        })
        return posts
    } catch (e) {
        console.log(e)
        return null
    }
}

const episode = async (id) => {
    const response = await axios.default.get(`${EPISODE_URL}${id}`)
    const $ = cheerio.load(response.data)
    postTitle = $('.entry-header .entry-title').text()
    postSeries = postTitle.replace(/^.*【PV】|(Episode|Episodio).*$/g, '').trim()
    episodeMatch = postTitle.match(/(?<=(Episode|Episodio)\s*)(\d+)/g)
    postEpisode = parseInt(episodeMatch != null ? episodeMatch[0] : null)
    postViews = parseViews($('#sidebar i.count').html())
    postTags = $('#extras').find('a').toArray().filter((item) => $(item).attr('rel') == 'tag').map((item) => item = $(item).text())
    postType = postTitle.match(/^.{0,4}(PV)/g) == null ? "Episode" : "Preview"
    script = $('#page').find('script').last().html()
    const servers = ['va01', 'va02', 'va03', 'va04']
    const server = "https://" + servers[Math.floor(Math.random() * 4)] + "-edge.tmncdn.io";
    streamUrl = `${server}${script.match(/(?<="file":").*(m3u8)/g)[0].replace(/\\\//g, "/")}`
    try {
        subUrl = `${server}${script.match(/(?<=subs=")[^"]*/g)[0].replace(/\\\//g, "/")}`
    } catch (e) {
        subUrl = null
    }
    return {
        id: id,
        series: postSeries,
        episode: postEpisode,
        type: postType,
        audio: getLanguage(postTitle)[0],
        subtitles: getLanguage(postTitle)[1],
        streamUrl: streamUrl,
        subUrl: subUrl,
        tags: postTags,
        views: postViews
    }
}

const allSeries = async () => {
    const rep = await axios.default.get(SERIES_URL)
    const $ = cheerio.load(rep.data)
    list = $('.holdinner').find('li').toArray().map((item) => item = { name: $(item).find('a').text(), url: $(item).find('a').attr('href') })
    return list
}

const allGenres = async () => {
    const rep = await axios.default.get(GENRES_URL)
    const $ = cheerio.load(rep.data)
    list = $('.holdinner').find('li').toArray().map((item) => item = { name: $(item).find('a').text().trim(), count: $(item).find('.mctagmap_count').text().match(/\d+/g)[0], url: $(item).find('a').attr('href') })
    return list
}

const allPosts = async (page = 1, orderBy = 'date', order = 'desc') => {
    const rep = await axios.default.get(`${POSTS_URL}${page}`, {
        params: {
            orderby: orderBy,
            order: order
        }
    })
    const $ = cheerio.load(rep.data)
    list = $('.item').toArray().map((item) => item = parsePost($, item))
    return list
}

const byLanguage = async (lang = 'raw', page = 1, orderBy = 'date', order = 'desc') => {
    var LANG_URL = RAW_URL
    switch (lang) {
        case 'eng':
            LANG_URL = ENGLISH_URL
            break
        case 'spa':
            LANG_URL = SPANISH_URL
            break
        case 'raw':
        default:
            LANG_URL = RAW_URL
            break
    }
    const rep = await axios.default.get(`${LANG_URL}${page}`, {
        params: {
            orderby: orderBy,
            order: order
        }
    })
    const $ = cheerio.load(rep.data)
    list = $('.item').toArray().map((item) => item = parsePost($, item))
    return list
}


module.exports = { quotes, latest, search, serie, episode, allSeries, allGenres, allPosts, byLanguage }