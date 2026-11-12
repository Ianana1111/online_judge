# C 語言學習地圖（judge.tw/learn/c）

給家教學生的 C 語言學習網站：13 章由淺到深，每章有觀念動畫、逐步執行（trace），和可以直接寫程式、馬上檢查對錯的練習。學生寫的程式只在瀏覽器裡執行（`apps/web/lib/learn-c/interp/` 是自己寫的 C 子集解譯器，跑在 Web Worker 裡），不會送到伺服器。

**只開放給學 C 的家教學生**：內容（章節、練習、課堂題目的解答和筆記）不在這個公開的 repo 裡，而是放在老師自己的家教資料夾，用發布指令寫進資料庫的 `learn_contents` 表。API 的 `GET /learn/c/content` 只回給有「C 語言」標記（`learnC`）的帳號和管理員；沒登入的人只看得到「請先登入」，其他帳號（包括只有 CPE 的學生）看到「還沒有開通」。

學生分兩種，都在後台「使用者」頁面切換：

- **學生**（`isStudent`）：CPE 用的 Pro 權限、學生排行等。
- **C 語言學生**（`learnC`）：除了上面全部，導覽列多一個「C 語言學習地圖」，可以讀學習地圖。打開 C 語言會自動成為學生；取消學生也會一起取消 C 語言。

## 分工

| 位置 | 內容 | 公開？ |
|---|---|---|
| `apps/web/app/learn/c/` | Next.js 頁面：權限畫面、頁面骨架（`shell.ts`）、樣式（`learn-c.css`，全部限定在 `.lm-root` 底下） | 是（不含內容） |
| `apps/web/lib/learn-c/` | 解譯器（`interp/`）和頁面程式（`app/`：編輯器、逐步執行、練習檢查、動畫），由 Next.js 一起打包 | 是 |
| `content/learn-c/`（這裡） | 內容檢查與打包 `build.mjs`、測試、寫內容用的小工具 | 是 |
| 家教資料夾 `learning_map/` | `chapters/*.md`、`practice/*.md`、`problems.json`（選填） | **否** |
| 家教資料夾 `N_class/P*/` | 每題的 `solution.c`、`knowledge.md`、`sample.in`（`topic.jpg` 不會被讀取） | **否** |
| 資料庫 `learn_contents` | 發布後的整份內容（JSON） | 只給 C 語言學生 |

## 新增課堂或修改內容

在家教資料夾新增 `2_class/P1/`（裡面有 `solution.c` 就算一題），或修改章節、練習之後：

```sh
# 1. 檢查並打包（練習參考解答、trace、動畫名稱都會驗證）；內容只寫到 content/learn-c/dist（已 gitignore）
node content/learn-c/build.mjs --content=<家教的 learning_map 資料夾>

# 2. 發布到資料庫：先預覽，確認後加 --apply（同一版本重跑不會寫入）
node --import ./packages/db/node_modules/tsx/dist/loader.mjs packages/db/scripts/publish-learn-content.ts \
  --file=content/learn-c/dist/content.json [--apply]
```

新題目會自動出現在「題目總覽」：題名從 `knowledge.md` 的「# P1 題名：知識點筆記」抓，摘要從「> 本題主打：…」抓，「這題和第 1 堂課 P5 是同一題」會自動標成重複題。要讓它出現在路線圖上，就在相關章節加 `:::problem 2_class/P1 說明`。

只改內容不需要重新部署網站。改了 `apps/web/lib/learn-c/` 或 `apps/web/app/learn/c/` 的程式，才需要照一般流程 commit、等 CI 通過後部署。新增動畫時，`build.mjs` 會從 `apps/web/lib/learn-c/app/anims-*.js` 讀出可用的動畫名稱來檢查章節。

## 測試

```sh
node content/learn-c/tests/run-all.mjs [--content=<learning_map>]   # 解譯器 vs gcc、錯誤訊息、trace、動畫；給 --content 會再加上課堂解答和練習
```

repo 本身的測試：`tests/learn-content.integration.test.ts`（API 權限，需要測試資料庫）、`tests/e2e/learn-c.spec.ts`（用假內容的全流程：權限、導覽列連結、練習在 Worker 裡執行、動畫，`RUN_FULL_SITE_E2E=1`）。

`tools/fill_outputs.py` 會用 gcc 執行練習的參考解答，把期望輸出填進 `practice/*.md`；`tools/add_traces.py`、`tools/add_anims.py` 會把逐步執行和動畫插進章節（這三個工具都用 `--content` 指定的家教資料夾）。
