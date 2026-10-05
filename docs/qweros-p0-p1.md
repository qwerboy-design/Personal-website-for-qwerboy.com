# qwerOS P0／P1 調整紀錄

更新日期：2026-10-05。

## 已採用的內容決策

- 對外職稱為「資深產品經理／Senior Product Manager」。過往職涯職稱保留原有經歷，不溯及修改。
- EN／TW 按鈕切換同一內容的對應網址；繁體中文採根路徑，英文採 `/en/...`。網址是語系的來源，localStorage 不覆蓋直接連結語系，不需要 cookie。
- 外觀保留三種 Product Design 方向，可在 menu bar 切換 Ivory、Midnight、Jade；選擇保存在 localStorage，切換不改變目前路由或語系。
- Photos 與 Travel 保持獨立內容與路由。Dock 旅行入口採 Blog 名稱。
- PDF 正式納入公開部署：`assets/downloads/Mike.pdf` 為建置來源。現有 PDF 是舊版履歷，這次沒有重製 PDF，不能宣稱下載檔內職稱已同步更新。
- 本專案明確不使用 analytics。沒有新增追蹤 script、事件上報或分析 SDK；瀏覽器歷史與視窗 localStorage 僅供本機互動。

## 靜態內容與 SEO

`scripts/build_static.mjs` 讀取 `js/content.js` 和 `js/translations.js`，產生首頁、About、Resume、Projects、Contact、AI、Travel、Photos、Coffee 以及十二個專案詳情的繁體中文與英文 HTML，共 42 頁。關閉 JavaScript 仍可閱讀介紹、職涯、技能、教育、聯絡方式、專案的概覽／問題／解法／角色／架構脈絡和連結。互動視窗使用同一份內容模型。

每個路由具自己的 title、description、canonical、JSON-LD WebPage／ProfilePage／ContactPage／CollectionPage 與 Person 關聯。專案詳情增加 CreativeWork。canonical 路徑除語系首頁外不以 `/` 結尾，符合互動 URL 正規化。每頁均列 `zh-TW`、`en` 及 `x-default` 對應頁，x-default 指向繁體中文。sitemap 包含所有路由與互相對應的語系；robots 指向 sitemap。GitHub Pages 實際檔案使用目錄 `index.html`，平台可能將目錄網址轉址為末尾斜線；canonical 不隨該轉址改變。

## 指標證據與專案模型

所有指標帶 `source`、`scope`、`verified`。現有數字皆為 Mike 提供的履歷／作品集自述，`verified: false`，介面呈現來源、範圍與未獨立查證的狀態。

`+200%` 範圍定義為 HIS Web 現代化的檢驗、血庫、報表與臨床流程；同等時間作業完成量較舊流程增加 200% 等於 3 倍。`-80%` 範圍定義為報告整理、檢體分流與資料介接自動化；同等案件量人工處理工時剩餘 20%。這是現有產品架構的範圍定義，不能取代量測證據，也不表示全院人力減少。基準值、量測期間與實際納入模組／流程仍待 Mike 提供，不虛構日期或數據。

Project 使用 `slug`、`verified`、`demoUrl`、`githubUrl`、`caseStudyUrl`。未提供的 GitHub 連結保持 `null`，不捏造 repo；內站詳情即 case study 入口。`verified: false` 不代表產品不存在，而是本次未做外部服務與架構的獨立驗證。

## 視窗、網址與無障礙規則

- Projects Detail 為 Projects 視窗的內部狀態；`/projects/:slug` 直接開啟 Projects 並選取對應專案。返回列表清除 slug。
- active 視窗決定 URL；history snapshot 保留當時開啟視窗。返回／前進復原狀態，不再推入另一筆 history。
- 關閉或最小化 active 視窗時，切至 z-order 最高的可見視窗；沒有可見內容視窗時回到當前語系首頁。
- EN／TW 完整導向相同內容的對應頁，避免地址與內容語系不一致。
- position／size 採 localStorage version 2 儲存，並依外觀分開保存；復原時檢查有限數字並限制在 viewport。小螢幕內容使用行動布局，不套用桌面越界座標。儲存失敗不阻止內容閱讀。
- 視窗帶可識別角色與名稱；關閉後焦點回到啟動按鈕或有效導覽入口。視窗與 Dock 控制有至少 24×24 CSS pixel 點擊區域。

## 建置與部署

```sh
node scripts/build_static.mjs
python3 -m http.server 8000 --directory .site-build
```

生成器更新 repository 路由 HTML，同時產出 `.site-build/` 公開 artifact；該目錄已忽略，不作為來源提交。部署 workflow 使用 Node 22 先生成，再只上傳 `.site-build`。公開 artifact 僅包含路由 HTML、assets、css、js、CNAME、sitemap、robots、`.nojekyll`。`docs/output` 求職文件、`docs/source` 原始資料、技能、程式腳本與 Git metadata 不會因上傳 repo 根目錄而意外公開。PDF 只複製經使用者指定的 Mike.pdf。

## 待補證據

- 未找到獨立的 qwerOS v2 決策文件；現有 `spec.md` 是舊 Bento 2.0 規格。這次以使用者列出的 P0／P1 與決策為依據。
- PDF 內容更新、指標基準與期間、外部 demo 可用性仍需要各自的證據，不能由 HTML build 代替。
- 本次只實作與本地驗證，未推送、發布或修改第三方設定。

## 本地驗證結果

- `node --test tests/*test.cjs`：模型、URL／geometry、三外觀與靜態 artifact 測試通過。
- `tests/browser.cjs`：Chromium 桌面 history、Projects 內部詳情、焦點返回、尺寸保存／重載、Ivory／Midnight／Jade、EN／TW、Spotlight focus trap、Terminal 指令、行動版返回與 8 個核心無 JS 頁面通過。
- 本輪透過 Codex in-app browser 檢視 1440×1024 桌面與 390×844 行動 viewport（扣除捲軸內容寬度 375px）；三外觀皆可切換，重載保留外觀，EN／TW 保留外觀並同步內容，行動版無橫向溢出。未進行正式環境發布或外部服務驗證。
- 三主題共用 `js/presentation.js` 的真實履歷內容，`css/themes.css` 定義外觀，`js/themes.js` 處理選擇與保存。桌布為獨立生成素材；SVG 圖示使用 Phosphor Icons，MIT 授權隨公開素材保存。實作截圖與對照位於 `docs/design/`，設計驗證紀錄位於 `design-qa.md`。
- 尚未建立全站 coverage 基準；Node VM 內容讀取的 coverage 輸出不代表全站涵蓋率。
- artifact 素材採明確公開檔案清單；排除 Finder metadata 與未引用的生成來源素材。

執行瀏覽器測試需既有 Playwright／Chromium：`QWEROS_PLAYWRIGHT=/path/to/playwright QWEROS_BASE_URL=http://127.0.0.1:8000 node tests/browser.cjs`。

## 專案內容更新

2026-10-05 依本地來源掃描更新為 11 個作品，簡介與三個主要功能同步 TW／EN。掃描範圍、來源與狀態邊界見 [專案來源掃描](project-source-audit.md)。Gemini 已依使用者指示移除，LikeRoom 開源延伸已如實標示；未知展示網址不新增外部入口。

2026-10-05 新增 LINE 請假自動化（依 `/Volumes/AI_Data/金財通/LINE請假自動化文件/v2.0-正式技術移轉_20260916-r2` 的文件核對），合計 12 項；聯絡 Mike 旁增加使用者指定 GitHub 儲存庫入口，三主題、TW／EN 共用。
