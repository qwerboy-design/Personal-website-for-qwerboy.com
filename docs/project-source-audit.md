# 作品集專案來源掃描

日期：2026-10-05。用途：更新 qwerOS 專案內容；只讀檢視來源工作區，僅修改本履歷網站。

以 Codex 已登錄專案與 `/Volumes/AI_Data` 的本地作品為範圍，讀取 README、manifest、功能模組、API 與現有架構文件。沒有讀取密鑰、帳號 token 或客戶資料，也沒有啟動外部 API、寄信、發文或訂票。

## 簡易介紹與證據

| 專案 | 簡易介紹 | 本地來源證據 |
|---|---|---|
| Healthcare AI Assistant | AI 對話、FHIR 匯入與隱私遮罩，協助整理醫療資訊。 | `/Volumes/AI_Data/Health-Care-Assistant-main/README.md`、`app/api/chat/route.ts`、`components/fhir/FHIRImportModal.tsx`、`app/(admin)/admin/llm-settings/page.tsx` |
| Mike's Coffee | 商品、規格、購物車、訂單與店家通知整合。 | `/Volumes/AI_Data/Coffee_Order_platform/README.md`、`components/customer/ProductCard.tsx`、`app/api/orders/route.ts`、`lib/n8n/webhook.ts` |
| EDM Platform | 文章轉電子報、訂閱名單、排程寄送與開信追蹤。 | `/Volumes/AI_Data/EDM-Platform/docs/FEATURE-OVERVIEW.md`、`src/app/api/newsletters/[id]/send/route.ts`、`src/app/api/cron/send-scheduled/route.ts` |
| Mike Wiki | 有來源、可交叉連結與搜尋的個人知識庫。 | `/Volumes/AI_Data/Mike_Wiki/Mike_Wiki/Mike_Wiki.md`、`web/wiki-query.js`、`wiki/index.md` |
| IG / Threads Automation | 文案、素材、排程、發佈狀態與成效整理。 | `/Volumes/AI_Data/IG_Threads/docs/system-architecture.md`、`src/meta_social_core/publisher.py`、`scheduler.py` |
| LikeGrok · AI Meeting Room | 多個 AI 專家協作討論、審閱與整理結論。 | `/Volumes/AI_Data/LikeGrok/README.md`、`app/api/chat/route.ts`、`lib/ai/orchestrator.ts` |
| FlightBot v2 | 多來源航班搜尋、結果正規化與價格快照。 | `/Volumes/AI_Data/LikeGrok-v2-flight/README.md`、`app/api/v2/flights/search/route.ts`、`lib/flights/fare/manager.ts` |
| LikeRoom / FilmDevelop | 既有開源照片工具的本地延伸，探索底片風格與 Lite 流程。 | `/Volumes/AI_Data/LikeRoom/README.md`、`PhotoStyleApp/PhotoStyleWebCoordinator+StyleActions.swift`、`PhotoStyleShared/Sources/PhotoStyleShared/PhotoStylizer.swift` |
| Flight Mike | 航班搜尋、目的地探索、住宿比較與 Chrome 擴充。 | `/Volumes/AI_Data/Flight_Mike/README.md`、`backend/server.js`、`frontend/src/app/hotels/page.tsx`、`chrome-extension/service-worker.js` |
| qwerOS Portfolio | macOS 風格的雙語履歷與作品桌面，含靜態內容及三主題。 | 本站 `js/content.js`、`js/script.js`、`js/themes.js`、`scripts/build_static.mjs` |
| ImageConvert · Social Reels | 旅行與產品素材轉直式短影音的製作工作區。 | `/Volumes/AI_Data/ImageConvert/docs/hyperframes-ig-reel-playbook.md`、`hyperframes-lake-bolsena-ig/package.json`、`ig-threads-ai-posting-demo/index.html` |

## 內容決策

- 新增 9 項作品，保留 Healthcare AI 與 Coffee slug，依使用者指示移除 Gemini Fintech，合計 11 項。清單預設「全部專案」，也可篩選精選、AI、Healthcare、Full Stack、內容平台、影像工具與旅行。
- 卡片只顯示一句話介紹、三個主要功能、技術與入口；詳情補問題、解法、角色及架構。所有新內容同步繁體中文／英文。
- `features` 為雙語功能陣列；`evidence` 記錄 `source-review`、日期與檢視範圍。`verified: false` 保留，來源檢視不等於部署、外部供應商或正式功能驗收。
- HCA 報告草稿功能受開關控制且需人工審閱，未描述為診斷或治療功能。
- FlightBot Daily Watch 仍需外部排程與通知驗證，未宣稱正在自動監控；機票與住宿介紹不含即時價格、空房或購買承諾。
- Gemini 原先「智慧金融分析工具」敘述缺乏本地實作支持，依使用者指示從作品集移除；依賴清單不作為功能已實作的證據。
- LikeRoom 依 README 明確保留 FilmDevelop 開源延伸定位，避免把上游工具描述為個人從零開發。影像風格屬藝術近似。
- 原網站 HCA、Coffee 展示網址沿用，未確認與本地版本相同或可用；qwerOS 使用既有網站網址。其他專案 `demoUrl`／`githubUrl` 為 null，不捏造連結，仍有內站案例入口。
- ImageConvert 描述為內容製作工作區，沒有描述為獨立已上線服務。
- LINE 請假文件已在 `/Volumes/AI_Data/金財通/LINE請假自動化文件/v2.0-正式技術移轉_20260916-r2` 找到，依使用者指示加入作品集。其他照片資料夾、第三方工具、重複 starter／備份與公司客戶專案未直接加入。
- 來源絕對路徑僅存於本內部文件，不寫入公開內容模型。部署 artifact 不包含 docs 或其他專案原始碼。

## 驗證

- 建置生成 40 個 TW／EN 靜態頁，涵蓋全部 11 個案例；同步 sitemap、hreflang、JSON-LD。
- 15 項 Node 測試通過，含雙語內容完整性、空展示網址、分類、案例詳情、所有靜態連結與視窗最小寬度。
- 新專案 renderer 拆至 `js/projects.js`，維持主程式小於 800 行。
- 發現並修正手機／桌面切換壓縮桌面視窗：行動模式不保存桌面 geometry，桌面復原時重新載入並對履歷／專案限制可讀最小寬度。
- 未重新驗收來源專案的 build、測試或外部服務；未推送／發布。

- In-app browser：桌面全部專案顯示 11 項且 Gemini 為 0 項；影像分類顯示 LikeRoom／ImageConvert，EN 切換同步簡介。行動旅行分類可操作並開啟 FlightBot 詳情；375px 內容寬度無橫向溢出，回到桌面視窗復原至少 680px。
- 最新實作截圖：`docs/design/projects-updated.png`。

## LINE／GitHub 補充

LINE 請假自動化以 v2.0 README、`01_系統架構與資料流.md`、`02_功能規格與操作契約.md` 為來源，使用 `documentation-review`。介紹本人確認、身分綁定、Outlook／條件式 Excel、事件去重與錯誤補償；不公開公司租戶、Flow ID、Run ID、帳號或個人資料。文件記錄已上線，本輪未操作正式系統。加入後共 12 個專案及 42 頁雙語靜態頁。

GitHub 按鈕在 Identity、Resume、About 的聯絡 Mike 旁並排，使用 `https://github.com/qwerboy-design?tab=repositories`，另補靜態導航、Contact 及 Person sameAs。

本輪更新驗證：17 項 Node 測試通過；已於 in-app browser 確認 LINE 案例與 GitHub 並排按鈕，行動版無橫向溢出。
