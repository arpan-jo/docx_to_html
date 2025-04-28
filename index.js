

const fs = require('fs');
const mammoth = require('mammoth');
const { htmlStructure } = require('./template')
const folders = require('./files')
const path = require('path');
const { getTableOfContent } = require('./toc')
const { modifyFootNoteLink, footNoteValues, removedOldFootNote } = require('./footnote')

/**
 * 
 * @param {string} filePath 
 * @param {string} outputDir 
 * @param {string} fileName 
 */
async function convertDocxToHtml(filePath, outputDir, fileName, level) {
    try {

        //docx file read
        const fileBuffer = fs.readFileSync(filePath);
        var options = {
            styleMap: [
                "p[style-name='gatha'] => p.gatha:fresh",
                "p[style-name='gatha0'] => p.gatha:fresh",
                "p[style-name='gatha1'] => p.gatha1:fresh",
                "p[style-name='gathalast'] => p.gathalast:fresh",
                "p[style-name='gathalast Char'] => p.gathalast_Char:fresh",
                "p[style-name='meta'] => p.meta:fresh",
                "p[style-name='meta_title'] => p.meta_title:fresh",
                "p[style-name='Heading 1'] => h1:fresh",
                "p[style-name='Heading 2'] => h2:fresh",
                "p[style-name='Heading 3'] => h3:fresh",
                "p[style-name='Heading 4'] => h4:fresh",
                "p[style-name='note'] => p.note:fresh",
                "p[style-name='apple-converted-space'] => p.apple-converted-space:fresh",
                "p[style-name='Quote Char'] => p.Quote-Char:fresh",
                "p[style-name='bookname'] => p.bookname:fresh",
                "p[style-name='center'] => p.center:fresh",
                "p[style-name='bookInfo'] => p.bookInfo:fresh",
                "p[style-name='bookInfo 2'] => p.bookInfo-2:fresh",
                "p => p.MsoNormal:fresh",



            ],
            includeDefaultStyleMap: true
        };
        // docx to HTML 
        const result = await mammoth.convertToHtml({ buffer: fileBuffer }, options);

        // converted html text
        let html = result.value;

      

        html = html.replace(/<em([^>]*)>/gim, '<i$1>');
        html = html.replace(/<\/em>/gim, '</i>');

        html = html.replace(/<strong([^>]*)>/gim, '<b$1>');
        html = html.replace(/<\/strong>/gim, '</b>');


        //const footnoteExtract = 

        // Logging warning messages
        if (result.messages && result.messages.length > 0) {
            console.log("Warnings during conversion:");
            result.messages.forEach((msg, index) => {
                console.log(`${index + 1}. ${msg.message}`);
            });
        }

        // footnote values extracted
        const modifidNotes = footNoteValues(html)

        //without footnote html text
        html = removedOldFootNote(html)
        //modified footnote link
        html = modifyFootNoteLink(html)

        // extra attribute addiding in MsoNormal class
        html = html.replace(/class="MsoNormal"/gim, 'class="MsoNormal" style="text-align:justify;"')

        // extra attribute addiding in center class
        html = html.replace(/class="center"/gim, `class=MsoNormal align=center style='text-align:center'`)


        // extract a new line of h1, h2, h3, h4 and p tag
        html = html.replace(/<\/(h[1-4]|p)>/gim, (match, g1, g2) => {
            //  console.log(g2)
            return match + "\n"
        })

        html = cleanHeadingAnchors(html)
        
        // table of content extracted
        const toc = getTableOfContent(html, level)

        // bookInfo extracted [বইয়ের নাম, লেখক ]
        const bookInfo = getBookInfo(html)

        // format heading
        html = formatHeading(html)


        const slideArray = swiperWrapper(html)


        //fileName => 01. খুদ্দক নিকায় ও অর্থকথা.docx
       const fileNameInfo = fileName.replace('.docx', '').split('.')
        
        const bookname = fileNameInfo[1].trim()

        const outputFileName = fileNameInfo[0].startsWith('0') ?  fileNameInfo[0].slice(1) : fileNameInfo[0]

        const dataLocation = outputDir + "/" + outputFileName

        //removed unwanted text. like ভূমিকা, অনুবাদকের কথা... ইত্যাদি
        slideArray.shift()

        //insert in first slide
        const firstSlide = slideArray[0].replace(/<div class="swiper-slide">/, `<div class="swiper-slide">\n${bookInfo}`)
        const fnotes = modifidNotes

        // removed first slide
        slideArray.shift()

        // remaining slide
        const slides = slideArray

        const content = htmlStructure({
            bookname,
            dataLocation,
            firstSlide,
            slides,
            toc,
            fnotes
        })


        console.log('Conversion successful!' + `/output/${outputDir}/${outputFileName}.html`);
    } catch (err) {
        console.error('Error converting file:', err);
    }
}

/**
 * 
 * @param {*} html 
 * @returns {string}
 */
function getBookInfo(html) {

    const regex = /<p class="bookInfo">([\s\S]*?)<\/p>/gi;
    const matches = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
        matches.push(match[0].replace(/<p class="bookInfo">/, "<p class=MsoNormal align=center style='text-align:center'>"));
    }

    return matches.join('\n');
}


/**
 * 
 * @param {string} html 
 * @returns {string}
 */
function formatHeading(html) {

    const withFormatHtml = html.split('\n')
        .map(line => {
           return line.replace(
                /<h([1-4])><a id="([^"]+)"><\/a>(.*?)<\/h\1>/i,
                (_, level, id, text) => {
                    text = text.replace(/<\/?b>/gi, '');
                    return `<h${level} align=center style='margin-top:0in;text-align:center'><a id="${id}"></a><b>${text}</b></h${level}>`;
                }
            );
        })

    return withFormatHtml.join('\n')

}


function cleanHeadingAnchors(html) {
    let uniqueIdCounter = 1; // uid counter

    return html.replace(/<(h[1-6])([^>]*)>(.*?)<\/\1>/gis, (match, tag, attrs, content) => {
        // all <a> capture
        let aTags = [...content.matchAll(/<a\s+([^>]*)>(.*?)<\/a>/gis)];
        
        if (aTags.length > 0) {
            // If there is more than one a
            let idTag = aTags.find(([full, attrs]) => /id\s*=/.test(attrs));

            if (!idTag) {
                idTag = aTags[0]; // If there is no ID, keep the first one. 
            }

            // Remove all a tags
            content = content.replace(/<a\s+[^>]*>(.*?)<\/a>/gis, '$1');

            // Insert the a tag again which is have id attr
            const [full, idAttrs, innerText] = idTag;
            content = `<a ${idAttrs}></a>` + content;
        } else {
            // If there is no <a> tag, insert a tag with custom id.
            const newId = `_customId${uniqueIdCounter++}`;
            content = `<a id="${newId}"></a>` + content;
        }

        return `<${tag}${attrs}>${content}</${tag}>`;
    });
}


/**
 * 
 * @param {string} html 
 * @returns {Array}
 */

function swiperWrapper(html) {
    const lines = html.split('\n');
    const slides = [];
    let currentSlide = [];

    const isHeading = line => line.includes('[New Section]');

    const divEnd = `<br clear=all>
        <p class=MsoNormal style='text-align:justify;' align=left>&nbsp;</p>`

    lines.forEach((line) => {
        if (isHeading(line)) {
            // console.log(line)
            line = ''
            if (currentSlide.length > 0) {
                slides.push(`<div class="swiper-slide">\n${currentSlide.join('\n')}\n ${divEnd}</div>`);
                currentSlide = [];
            }
        }
        currentSlide.push(line);
    })

    // push last slide
    if (currentSlide.length > 0) {
        slides.push(`<div class="swiper-slide">\n${currentSlide.join('\n')}\n ${divEnd}</div>`);
    }



    //console.log(slides)
    return slides;
}



function runall() {
    folders.forEach((child) => {
        child.files.forEach((file) => {
            const filePath = path.join(__dirname, "docx", child.sourceDir, file);
            convertDocxToHtml(filePath, child.dir, file, 1);
        })
    })

}

// fs.access(filePath, fs.constants.F_OK, (err) => {
//     console.log(err ? 'file not found' : 'file exist');
//   });

const filePath = path.join(__dirname, "docx", folders[0].sourceDir, folders[0].files[1]);
 convertDocxToHtml(filePath, folders[0].dir, folders[0].files[1], 1);


// runall()