
/**
 * 
 * @param {string} html 
 * @param {number} level
 * @returns {string}
 */


function getTableOfContent(html, level = 1) {

    let index = 0
    const headings = html.split('\n').filter((line) => {
        if (line.startsWith('<h1') || line.startsWith('<h2') || line.startsWith('<h3') || line.startsWith('<h4') || line.includes("[New Section]")) {
            return line
        }
    })

    return headings.map((line, lineNum) => {

        if (line.startsWith('<h1')) {
            index++
        }



        if (line.startsWith('<h2')) {
            //  index++

            if (level == 2 & headings[lineNum - 1].includes('[New Section]')) {
                // console.log(headings[lineNum -1])
                index++
            }
        }


        
        



        return replacer(line, index)
    }).join('\n')

}

function replacer(line, index) {
    // h1-h4 => <p>
   // console.log(line)

    if (line.includes('[New Section]')) {
        return ''
    }


    line = line.replace(/<h([1-4])><a id="([^"]+)">/i, (_, level, id) => {
        return `<p class="MsoToc${level}"><a data-slide="${index - 1}" href="#${id}">`;
    });

    // h1-h4 => </p>
    line = line.replace(/<\/h[1-4]>/i, '</p>');

    // a tags removed if empty href attribute. 
    line = line.replace(/<a(?![^>]*href=)[^>]*><\/a>/g, '');

    line = line.replace(/<\/?b>/gi, '');

    line = line.replace(
        /(<p class="MsoToc\d+">.*?<a [^>]+>)(<\/a>)([^<]+)(<\/p>)/i,
        (_, startTag, closeATag, text, closePTag) => {
           
            return `${startTag}${text}${closeATag} ${closePTag}`;
        }
    );

    return line;
}

module.exports = { getTableOfContent }

// bookInfo
// center
// [New Section]

