

/**
 * 
 * @param {object} content 
 * @returns {string}
 */

function htmlStructure(content) {

    const {
        bookname,
        dataLocation,
        firstSlide,
        slides,
        toc,
        fnotes } = content
    const template = `
<div id="booknameDiv" style="display:block">
    <p id="bookname" data-location="${dataLocation}.html"><b>${bookname}</b></p>
</div>
<div id="viewport" style="display:block">
    <div style="display:block" class="swiper-container">
        <div class="swiper-wrapper">
            ${firstSlide}
        </div>
    </div>
</div>
<div id='slidesAll'>
    ${slides.join('\n')}
</div>
<div id="leftNav">
    ${toc}
</div>
<div id='ftnDiv'>
    ${fnotes}
</div>`

    return template;
}

module.exports = {htmlStructure}