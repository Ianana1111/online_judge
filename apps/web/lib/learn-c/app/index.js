/* ---------- 入口：網站的 /learn/c 頁面載入內容後呼叫 mountLearnC ---------- */
// 動畫的檔案要先載入，defineAnim 才會把它們註冊好
import "./anims-a.js";
import "./anims-b.js";
import "./anims-c.js";
import { setData } from "./util.js";
import { makePage, setPage } from "./page.js";

// 把內容放進頁面骨架（.lm-root 裡的 #route、#chapters…），回傳離開頁面時要呼叫的清除函式
export function mountLearnC(content) {
  setData(content);
  const page = makePage();
  setPage(page);
  page.init();
  return () => {
    page.destroy();
    setPage(null);
  };
}
