# macOS 風格登入預覽

此目錄保留獨立本地預覽。生成器以同一模板產出公開 `/login/` 與 `/en/login/`，桌布複製至公開素材 `assets/images/wallpaper-login.png`，原有 qwerOS 首頁仍可直接訪問。從專案根目錄執行 `python3 -m http.server 8767 --bind 127.0.0.1`，開啟 http://127.0.0.1:8767/docs/design/macos-login-preview/ 。需透過 HTTP 預覽，既有履歷頁使用根目錄資源 URL。

TW 登入前往 `/resume/`，EN 前往 `/en/resume/`，由既有 qwerOS 顯示履歷。登入為公開作品集導覽，不收取帳號或密碼。日期時間以 Asia/Taipei 顯示。

`macos-login-4k.png` 是 1920×1080 CSS viewport、2×像素密度的 3840×2160 完整畫面截圖。桌布使用內建 image_gen 生成，原始 1672×941；無法選擇或核實 GPT-Images 2.5，桌布不是原生 4K。真人照片沿用既有 `assets/images/profile-professional.jpg`。

生成 prompt：

> Use case: stylized-concept. Asset type: premium macOS-inspired login screen wallpaper for a personal portfolio, 16:9 landscape, 4K requested. Primary request: create a sophisticated immersive abstract landscape wallpaper, silky sculptural flowing hills like a macOS desktop wallpaper, deep midnight navy and luminous cobalt sweeping folds on the lower left, lavender and warm coral-peach sunset ribbons flowing diagonally across the upper right. Refined smooth gradients, immaculate polished finish, elegant calm ambient illumination, beautiful spacious composition. Center of frame should be dark desaturated blue with low contrast for readable white login UI to be added separately. Screen graphic only, edge to edge, no physical computer. No text, no people, no avatar, no logo, no controls, no UI, no stars, no grain, no watermark. Maximum crisp resolution.

驗證：Chrome 本地自動化已確認 TW／EN 點擊登入與履歷視窗渲染、390×844 手機版無橫向溢出、鍵盤 Enter 導覽、無 JavaScript 執行錯誤。已檢視桌面完整畫面；未執行全站 suite 或發布。
