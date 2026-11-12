# C 語言學習地圖（judge.tw/learn/c）

給家教學生的 C 語言學習網站：13 章由淺到深，每章有觀念動畫、逐步執行（trace），和可以直接寫程式、馬上檢查對錯的練習。學生寫的程式只在瀏覽器裡執行（`src/interp/` 是自己寫的 C 子集解譯器，跑在 Web Worker 裡），不會送到伺服器。

**只開放給家教學生**：內容（章節、練習、課堂題目的解答和筆記）不在這個公開的 repo 裡，而是放在老師自己的家教資料夾，用發布指令寫進資料庫的 `learn_contents` 表。API 的 `GET /learn/c/content` 只回給 `isStudent` 的帳號和管理員；沒登入的人只看得到「請先登入」，其他帳號看到「還沒有開通」。

## 分工

| 位置 | 內容 | 公開？ |
|---|---|---|
| `content/learn-c/`（這裡） | 解譯器、頁面程式（`src/`）、打包 `build.mjs`、測試、寫內容用的小工具 | 是 |
| `apps/web/public/learn/c/`、`apps/web/app/learn/c/` | 打包出來的頁面外殼（樣式、程式、解譯器）和回傳頁面的 Next.js 路由 | 是（不含內容） |
| 家教資料夾 `learning_map/` | `chapters/*.md`、`practice/*.md`、`problems.json`（選填） | **否** |
| 家教資料夾 `N_class/P*/` | 每題的 `solution.c`、`knowledge.md`、`sample.in`（`topic.jpg` 不會被讀取） | **否** |
| 資料庫 `learn_contents` | 發布後的整份內容（JSON） | 只給學生 |

## 新增課堂或修改內容

在家教資料夾新增 `2_class/P1/`（裡面有 `solution.c` 就算一題），或修改章節、練習之後：

```sh
# 1. 打包並檢查（練習參考解答、trace、動畫名稱都會驗證）；內容只寫到 content/learn-c/dist（已 gitignore）
node content/learn-c/build.mjs --content=<家教的 learning_map 資料夾>

# 2. 發布到資料庫：先預覽，確認後加 --apply（同一版本重跑不會寫入）
node --import ./packages/db/node_modules/tsx/dist/loader.mjs packages/db/scripts/publish-learn-content.ts \
  --file=content/learn-c/dist/content.json [--apply]
```

新題目會自動出現在「題目總覽」：題名從 `knowledge.md` 的「# P1 題名：知識點筆記」抓，摘要從「> 本題主打：…」抓，「這題和第 1 堂課 P5 是同一題」會自動標成重複題。要讓它出現在路線圖上，就在相關章節加 `:::problem 2_class/P1 說明`。

只改內容不需要重新部署網站。改了 `src/` 的程式才需要重新產生網站外殼並 commit：

```sh
node content/learn-c/build.mjs --content=<家教的 learning_map 資料夾> \
  --site=apps/web/public/learn/c --shell-ts=apps/web/app/learn/c/shell.generated.ts --base=/learn/c/
```

## 測試

```sh
node content/learn-c/tests/run-all.mjs [--content=<learning_map>]   # 解譯器 vs gcc、錯誤訊息、trace、動畫；給 --content 會再加上課堂解答和練習
node content/learn-c/tests/browser-check.mjs                         # 本機預覽（dist）用 Chrome 在嚴格 CSP 下實測並截圖
node content/learn-c/tests/gate-check.mjs --content=<learning_map>   # 沒登入、不是學生、還沒發布等畫面
```

repo 本身的測試：`tests/learn-content.integration.test.ts`（API 權限，需要測試資料庫）、`tests/e2e/learn-c.spec.ts`（用假內容的全流程，`RUN_FULL_SITE_E2E=1`）。

`tools/fill_outputs.py` 會用 gcc 執行練習的參考解答，把期望輸出填進 `practice/*.md`；`tools/add_traces.py`、`tools/add_anims.py` 會把逐步執行和動畫插進章節（這三個工具都用 `--content` 指定的家教資料夾）。
