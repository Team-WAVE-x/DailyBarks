/* eslint-disable no-unused-vars */
let showsw = false

function dwrite () {
  /**
   * @type {HTMLDivElement}
   */
  const elem = document.getElementsByClassName('write')[0]
  const wbtn = document.getElementsByClassName('wbtn')[0]

  if (showsw) {
    wbtn.innerHTML = '글쓰기'
    wbtn.classList.replace('btn-danger', 'btn-primary')
    elem.classList.replace('d-flex', 'd-none')
    showsw = false
  } else {
    wbtn.innerHTML = '닫기'
    wbtn.classList.replace('btn-primary', 'btn-danger')
    elem.classList.replace('d-none', 'd-flex')
    showsw = true
  }
}

function vote (id) {
  window.location.replace('/vote?id=' + id)
}
