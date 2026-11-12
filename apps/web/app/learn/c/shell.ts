// 學習地圖的頁面骨架（從原本的 page.html 搬過來）。內容由 lib/learn-c/app 的程式在瀏覽器裡填進去，
// 所以用 dangerouslySetInnerHTML 放進頁面、不讓 React 管理這些節點。這裡沒有任何課程內容。
export const SHELL_HTML = `
<nav class="side" id="side" aria-label="章節路線">
  <h1>C 語言學習地圖</h1>
  <p class="sub">從第一行程式，一站一站往下走</p>
  <div class="search">
    <label class="sr-only" for="search">搜尋章節、小節或練習</label>
    <input id="search" type="search" placeholder="搜尋：陣列、scanf、溢位…" autocomplete="off">
    <ul class="results" id="searchResults" hidden></ul>
  </div>
  <ol class="route" id="route"></ol>
  <div class="progress"><span id="progText">已讀 0 站</span><div class="bar"><span id="progBar"></span></div></div>
</nav>
<button class="menu" id="menuBtn" aria-controls="side" aria-expanded="false">章節</button>

<div class="lm-main">
  <div class="wrap">
    <header class="hero" id="top">
      <h2>C 語言學習地圖</h2>
      <p>每一章是一個站，順序由淺到深，建議照順序走。每條彩色路線是一道題目，它經過的站，就是這題用到的語法。</p>
      <p>每一站都有動畫、可以一步一步看程式怎麼跑的「逐步執行」，還有可以直接寫程式、馬上檢查對錯的練習。程式只在你的瀏覽器裡執行，不會傳到任何地方。</p>
      <div id="continue" hidden></div>
    </header>

    <section class="metro" aria-label="題目路線總圖">
      <div class="metro-head"><h3>路線總圖</h3><span>點站名跳到章節，點題目看完整解答與筆記</span></div>
      <table id="metro"></table>
    </section>

    <div id="chapters"></div>

    <section class="chapter" id="problems">
      <div class="ch-head"><div class="ch-badge dark">題</div><h2>題目總覽</h2></div>
      <p class="ch-lead">每題都有完整解答，和一份把用到的知識點講深一點的筆記。</p>
      <div id="plistWrap"></div>
    </section>
  </div>
</div>

<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="dTitle">
  <div class="shade" data-close></div>
  <div class="panel" id="dPanel">
    <div class="bar-top">
      <div class="row"><h3 id="dTitle"></h3><button class="close" data-close>關閉</button></div>
      <div class="stations" id="dStations"></div>
      <div class="tabs" role="tablist">
        <button role="tab" id="tabNotes" aria-selected="true">解題筆記</button>
        <button role="tab" id="tabCode" aria-selected="false">完整程式碼</button>
      </div>
    </div>
    <div class="body" id="dBody"></div>
  </div>
</div>
`;
