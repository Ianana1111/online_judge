/* ---------- 載入內容：只開放給家教學生 ---------- */
// 本機預覽：dist 的 data.js 已經把內容放在 window.LM_DATA。
// 網站上：向 API 拿 /learn/c/content（需要登入，而且帳號要是家教學生）。登入憑證過期（401）時先 refresh 再試一次。
const Loader = (function () {
  const GATES = {
    loading: { title: "載入中…", body: "" },
    login: { title: "請先登入", body: '這個學習地圖只開放給家教學生。請先<a href="/login">登入 judge.tw</a>，登入後再回到這個網址（judge.tw/learn/c）。' },
    student: { title: "這個帳號還沒有開通", body: "這個學習地圖只開放給家教學生。如果你是學生，請把你的 judge.tw 帳號告訴老師，開通之後重新整理這一頁就可以看了。" },
    notyet: { title: "內容還沒發布", body: "老師還沒有把學習地圖的內容發布到網站上，請晚一點再來看。" },
    error: { title: "載入失敗", body: '暫時拿不到內容，請<a href="">重新整理</a>再試一次。' },
  };
  function gate(kind) {
    const g = $("#gate");
    g.innerHTML = `<h3>${GATES[kind].title}</h3>${GATES[kind].body ? `<p>${GATES[kind].body}</p>` : ""}`;
    g.hidden = false;
  }
  const get = () => fetch(CONFIG.api + "/learn/c/content", { credentials: "include" });
  const refresh = () => fetch(CONFIG.api + "/auth/refresh", { method: "POST", credentials: "include" }).then((r) => r.ok, () => false);
  function boot(data) {
    setData(data);
    $("#gate").hidden = true;
    document.body.classList.remove("locked");
    Page = makePage();
    Page.init();
  }
  async function start() {
    if (window.LM_DATA) { boot(window.LM_DATA); return; }
    gate("loading");
    try {
      let res = await get();
      if (res.status === 401 && await refresh()) res = await get();
      if (res.status === 401) return gate("login");
      if (res.status === 403) return gate("student");
      if (res.status === 404) return gate("notyet");
      if (!res.ok) return gate("error");
      const body = await res.json();
      boot(body.content);
    } catch (e) {
      gate("error");
    }
  }
  return { start };
})();
