
/**
 * 
 * @param {string} html 
 * @returns {string}
 */


 function getTableOfContent (html) {

    let index = 0
    return html.split('\n').filter((line) => {
        if (line.startsWith('<h1') || line.startsWith('<h2') || line.startsWith('<h3') || line.startsWith('<h4')) {
            return line
        }
    }).map((line) => {
    
        if (line.startsWith('<h1')) {
            index++
        }
    
        return replacer(line, index)
    }).join('\n')
    
} 

function replacer(line, index) {
    // h1-h4 => <p>
    // console.log(line)
    line = line.replace(/<h([1-4])><a id="([^"]+)">/i, (_, level, id) => {
        return `<p class="MsoToc${level}"><a data-slide="${index - 1}" href="#${id}">`;
    });

    // h1-h4 => </p>
    line = line.replace(/<\/h[1-4]>/i, '</p>');

    // a tags without href attribute removed
    line = line.replace(/<a(?![^>]*href=)[^>]*><\/a>/g, '');

    line = line.replace(
        /(<p class="MsoToc\d+">.*?<a [^>]+>)(<\/a>)([^<]+)(<\/p>)/i,
        (_, startTag, closeATag, text, closePTag) => {
            return `${startTag}${text}${closeATag} ${closePTag}`;
        }
    );

    return line;
}

module.exports = {getTableOfContent}