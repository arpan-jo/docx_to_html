
/**
 * 
 * @param {string} html 
 * @returns {string}
 */

function modifyFootNoteLink(html) {
    console.log(typeof html)
    if(html.includes('#footnote')){
        return html.replace(
            /<sup><a href="([^"]+)" id="([^"]+)">\[(\d+)\]<\/a><\/sup>/g,
            (_, href, id, number) => {
    
                href = '_ftn' + href.split('-')[1]
                id = '_ftnref' + id.split('-')[2]
                return `<a href="#${href}" class="ftnRef" id="${id}" title="">[${number}]</a>`
            }
        );
    }

    return html
}


function footNoteValues(html) {
    let index = 1;
    let footnotes = [];

    // <ol> content </ol> captured
    const footNoteCapture = html.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
    
   
    if(footNoteCapture){
         // find out <li> tag 
    footNoteCapture[0].replace(/<li id="footnote-(\d+)">([\s\S]*?)<\/li>/gim, (_, num, content) => {

        // console.log(content)

        // <a> removing
        content = content.replace(/<p>\s*<a href="#footnote-ref-\d+">↑<\/a>\s*<\/p>/gim, '');
        // extra class added in <p>
        content = content.replace(
            /<p class="MsoNormal">(.*?)<\/p>/s,
            (_, innerText) => {
                return ` <p class="MsoFootnoteText"> <a href="#_ftnref${num}" id="_ftn${num}" title="">[${num}]</a> ${innerText}</p>`;
            }
        );

        footnotes.push(`<div id=ftn${num}>\n${content}\n</div>`);
        index++;
        return '';
    });
    }


    return footnotes.join('\n').trim();
}

function removedOldFootNote(html) {

    const match = html.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (match) {
        // html থেকে <ol>...</ol> রিমুভ
        return html.replace(match[0], '');
    }

    return html
}



module.exports = {
    modifyFootNoteLink,
    footNoteValues,
    removedOldFootNote
}