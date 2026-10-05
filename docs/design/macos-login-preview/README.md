# macOS 風格登入預覽

此目錄保留獨立本地預覽。生成器以同一模板產出公開 `/login/` 與 `/en/login/`，桌布複製至公開素材 `assets/images/wallpaper-login.png`，原有 qwerOS 首頁仍可直接訪問。從專案根目錄執行 `python3 -m http.server 8767 --bind 127.0.0.1`，開啟 http://127.0.0.1:8767/docs/design/macos-login-preview/ 。需透過 HTTP 預覽，既有履歷頁使用根目錄資源 URL。

TW 登入前往 `/resume/`，EN 前往 `/en/resume/`，由既有 qwerOS 顯示履歷。登入為公開作品集導覽，不收取帳號或密碼。日期時間以 Asia/Taipei 顯示。

登入頁首次進入會優先播放 H.264 `assets/animations/macos-boot-4k.mp4`，保留 `assets/animations/macos-boot-4k.webm` 作為其他影片來源，約 5 秒（原 8 秒影片以 1.6 倍速播放），`assets/animations/macos-boot-4k.gif` 作為備援，並以 `assets/images/macos-boot-poster.jpg` 先行顯示畫面。APPLE 標誌疊加白色柔光，每 3.2 秒緩慢呼吸一次；柔光沿用海報圖並與影片採相同裁切，支援桌面、手機與 GIF 備援。可按「略過動畫」，同一個瀏覽器工作階段只播放一次。加入 `?replay=1` 可重新播放；若使用者開啟 `prefers-reduced-motion`，會直接顯示登入畫面。

`macos-login-4k.png` 是 1920×1080 CSS viewport、2×像素密度的 3840×2160 完整畫面截圖。桌布使用內建 image_gen 生成，原始 1672×941；無法選擇或核實 GPT-Images 2.5，桌布不是原生 4K。真人照片沿用既有 `assets/images/profile-professional.jpg`。

生成 prompt：

> Use case: stylized-concept. Asset type: premium macOS-inspired login screen wallpaper for a personal portfolio, 16:9 landscape, 4K requested. Primary request: create a sophisticated immersive abstract landscape wallpaper, silky sculptural flowing hills like a macOS desktop wallpaper, deep midnight navy and luminous cobalt sweeping folds on the lower left, lavender and warm coral-peach sunset ribbons flowing diagonally across the upper right. Refined smooth gradients, immaculate polished finish, elegant calm ambient illumination, beautiful spacious composition. Center of frame should be dark desaturated blue with low contrast for readable white login UI to be added separately. Screen graphic only, edge to edge, no physical computer. No text, no people, no avatar, no logo, no controls, no UI, no stars, no grain, no watermark. Maximum crisp resolution.

驗證：Chrome 本地自動化已確認 TW／EN 點擊登入與履歷視窗渲染、390×844 手機版無橫向溢出、鍵盤 Enter 導覽、無 JavaScript 執行錯誤。已檢視桌面完整畫面；未執行全站 suite 或發布。

2026-10-05 Safari 修正：影片與 GIF 使用絕對定位覆蓋同一畫面，兩者的 `hidden` 均明確移出排版。GIF 載入成功前保持隱藏；影片錯誤可切換備援，GIF 失敗則保留清晰 Apple 海報及柔光，不顯示破圖邊框；略過後晚到的載入事件不會重新顯示素材。MP4 由原有 3840×2160、8 秒 WebM 轉碼，未更動動畫內容。Safari 桌面版以 Computer Use 檢視本地公開部署預覽，確認白線與破圖問號消失；失敗與晚到事件由 `tests/login-boot.test.cjs` 驗證。發布狀態以 GitHub Actions 部署紀錄為準。

手機模擬驗證（2026-10-05）：`tests/login-mobile.cjs` 使用相符 Playwright 與已安裝 WebKit／Chromium 測試 390×844、320×568、844×390、393×851，涵蓋中英文、播放中旋轉、滿版與橫向溢出、5 秒退出、略過、工作階段記憶、重新播放、語言切換、履歷導覽、全素材失敗及減少動態。新增影片 `<source>` 全失敗處理，避免 Chromium 不觸發 video error 時跳過 GIF 備援。Chromium 已驗證自動播放時間前進；WebKit 手機模擬拒絕自動播放（NotAllowedError），已驗證靜態備援及觸控後影片解碼。這不是 iOS／Android 實機驗證，iPhone 真實 Safari 自動播放及瀏覽器工具列安全區仍未驗證。測試輸出與截圖位於 `/tmp/qweros-mobile-qa/`；以 `QWEROS_PLAYWRIGHT` 指定與已安裝瀏覽器版本相符的套件，並以 `QWEROS_BASE_URL` 指定本地公開部署預覽。
