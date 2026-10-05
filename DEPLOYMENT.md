# 部署指南 - GitHub Pages + Cloudflare

本文件說明如何將個人網站部署到 GitHub Pages 並透過 Cloudflare 設定為 qwerboy.com 的首頁。

## 🚨 故障排查優先順序

當 `qwerboy.com` 失效時，先不要直接懷疑前端程式。請先執行：

```bash
bash scripts/check_site_health.sh
```

若結果顯示：

- `qwerboy.com` / `www.qwerboy.com` 無法解析
- 但 GitHub Pages bypass 對 `185.199.108.153` 到 `185.199.111.153` 仍回 `HTTP 200`

代表靜態網站本體仍在 GitHub Pages，優先修復 Cloudflare DNS，不要先改 `index.html` 或 `js/script.js`。

本次實際修復案例可參考：[docs/qwerboy-com-outage-2026-05-19.md](docs/qwerboy-com-outage-2026-05-19.md)

## 📋 前置需求

1. **GitHub 帳號**：如果還沒有，請到 [GitHub](https://github.com) 註冊
2. **Cloudflare 帳號**：如果還沒有，請到 [Cloudflare](https://www.cloudflare.com) 註冊（免費方案即可）
3. **域名 qwerboy.com**：確保您擁有此域名的管理權限，且已在 Cloudflare 管理

## 🚀 部署步驟

### 步驟 1: 建立 GitHub Repository

1. 登入 GitHub，點擊右上角的 **+** → **New repository**
2. Repository 設定：
   - **Repository name**: `Personal-website-for-qwerboy.com`
   - **Description**: `Personal website for qwerboy.com`
   - **Visibility**: 選擇 **Public**（GitHub Pages 免費方案需要 Public repository）
   - **不要**勾選 "Initialize this repository with a README"（因為我們已經有檔案了）
3. 點擊 **Create repository**

### 步驟 2: 推送程式碼到 GitHub

在終端機執行以下指令：

```bash
# 添加遠端 repository
git remote add origin https://github.com/qwerboy-design/Personal-website-for-qwerboy.com.git

# 推送程式碼
git branch -M main
git push -u origin main
```

**如何查看您的 GitHub 使用者名稱：**
- 登入 GitHub 後，點擊右上角的頭像
- 您的使用者名稱會顯示在個人資料中
- 或訪問 `https://github.com/settings/profile` 查看

如果遇到認證問題，您可能需要：
- 使用 Personal Access Token（GitHub Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token）
- 或使用 SSH 方式：`git@github.com:qwerboy-design/Personal-website-for-qwerboy.com.git`

### 步驟 3: 啟用 GitHub Pages

#### 3.1 使用 GitHub Actions（推薦方式）

本專案已包含 `.github/workflows/deploy.yml`，使用 GitHub Actions 自動部署。

1. 在 GitHub repository 頁面，點擊 **Settings** → **Pages**
2. 在 **Source** 區塊：
   - 選擇 **GitHub Actions**
3. 點擊 **Save**

#### 3.2 手動啟用（備選方案）

如果 Actions 方式有問題，可以使用傳統方式：

1. 在 GitHub repository 頁面，點擊 **Settings** → **Pages**
2. 在 **Source** 區塊：
   - **Branch**: 選擇 `main`
   - **Folder**: 選擇 `/ (root)`
3. 點擊 **Save**

#### 3.3 驗證 GitHub Pages 部署

1. 等待 1-2 分鐘讓 GitHub Pages 完成首次部署
2. 在 **Settings** → **Pages** 頁面，您應該會看到：
   - **Your site is live at**: `https://qwerboy-design.github.io/Personal-website-for-qwerboy.com/`
3. 訪問該 URL 確認網站正常運作

### 步驟 4: 在 Cloudflare 設定自訂域名

#### 4.1 確認域名已在 Cloudflare

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 確認 `qwerboy.com` 已在您的帳號中
3. 如果還沒有，請：
   - 點擊 **Add a site**
   - 輸入 `qwerboy.com`
   - 按照指示完成設定（Cloudflare 會掃描現有 DNS 記錄）

#### 4.2 取得 GitHub Pages 的 IP 位址

GitHub Pages 使用以下 IP 位址（選擇其中一組即可）：

**選項 A：使用 A Record（推薦，支援根域名）**
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**選項 B：使用 CNAME Record（僅支援子域名，不支援根域名）**
```
qwerboy-design.github.io
```

#### 4.3 在 Cloudflare 設定 DNS 記錄

1. 在 Cloudflare Dashboard，選擇 `qwerboy.com` 域名
2. 點擊左側選單的 **DNS** → **Records**
3. 設定以下 DNS 記錄：

**設定根域名（qwerboy.com）：**

由於 Cloudflare 不支援根域名的 CNAME（CNAME Flattening 除外），我們使用 A Record：

| Type | Name | IPv4 address | Proxy status | TTL |
|------|------|--------------|--------------|-----|
| A | @ | 185.199.108.153 | Proxied (橘色雲朵) | Auto |
| A | @ | 185.199.109.153 | Proxied (橘色雲朵) | Auto |
| A | @ | 185.199.110.153 | Proxied (橘色雲朵) | Auto |
| A | @ | 185.199.111.153 | Proxied (橘色雲朵) | Auto |

**設定 www 子域名（可選）：**

| Type | Name | Target | Proxy status | TTL |
|------|------|--------|--------------|-----|
| CNAME | www | qwerboy-design.github.io | Proxied (橘色雲朵) | Auto |

**說明**：本 repo 目前應直接指向 `qwerboy-design.github.io`。

**重要說明：**
- **Proxy status** 必須設為 **Proxied**（橘色雲朵圖示），這樣才能使用 Cloudflare 的 CDN 和 SSL
- 如果使用 **DNS only**（灰色雲朵），需要額外設定 SSL 憑證

#### 4.4 在 GitHub Pages 設定自訂域名

1. 回到 GitHub repository 頁面
2. 點擊 **Settings** → **Pages**
3. 在 **Custom domain** 區塊：
   - 輸入 `qwerboy.com`
   - 勾選 **Enforce HTTPS**（建議勾選）
4. 點擊 **Save**
5. GitHub 會驗證域名，這可能需要幾分鐘

#### 4.5 等待 DNS 傳播

- DNS 變更通常需要 **5-30 分鐘**才會生效（Cloudflare 通常很快）
- 您可以使用以下工具檢查 DNS 傳播狀態：
  - [whatsmydns.net](https://www.whatsmydns.net)
  - [dnschecker.org](https://dnschecker.org)
- 在終端機執行：`nslookup qwerboy.com` 或 `dig qwerboy.com`

### 步驟 5: 設定 Cloudflare SSL/TLS

1. 在 Cloudflare Dashboard，選擇 `qwerboy.com` 域名
2. 點擊左側選單的 **SSL/TLS**
3. 在 **Overview** 頁面：
   - 選擇 **Full (strict)** 模式（推薦）
   - 或選擇 **Flexible** 模式（如果 GitHub Pages 尚未提供 SSL）
4. 等待 Cloudflare 自動產生 SSL 憑證（通常 1-5 分鐘）

### 步驟 6: 設定 Cloudflare Page Rules（可選，推薦）

為了確保所有流量都使用 HTTPS，建議設定 Page Rule：

1. 在 Cloudflare Dashboard，選擇 `qwerboy.com` 域名
2. 點擊左側選單的 **Rules** → **Page Rules**
3. 點擊 **Create Page Rule**
4. 設定：
   - **URL**: `http://qwerboy.com/*`
   - **Setting**: `Always Use HTTPS`
5. 點擊 **Save and Deploy**

### 步驟 7: 驗證部署

1. 等待所有設定生效（通常 5-30 分鐘）
2. 訪問以下 URL 確認網站正常運作：
   - `https://qwerboy.com`（主要域名）
   - `https://www.qwerboy.com`（如果設定了 www）
3. 檢查 HTTPS 憑證是否正確安裝（瀏覽器應該顯示鎖頭圖示）
4. 確認網站內容正確顯示

### 緊急復原：當 DNS 記錄遺失時

若 Cloudflare zone 內只剩 `www -> qwerboy.com`，但根網域 `@` 的 `A` 記錄消失，`qwerboy.com` 與 `www.qwerboy.com` 都會一起失效。請至少恢復以下五筆：

| Type | Name | Content | Proxy status | TTL |
|------|------|---------|--------------|-----|
| A | @ | 185.199.108.153 | Proxied | Auto |
| A | @ | 185.199.109.153 | Proxied | Auto |
| A | @ | 185.199.110.153 | Proxied | Auto |
| A | @ | 185.199.111.153 | Proxied | Auto |
| CNAME | www | qwerboy-design.github.io | Proxied | Auto |

## 🔄 持續部署（CI/CD）

設定完成後，每次您推送程式碼到 GitHub 的 `main` 分支，GitHub Actions 會自動：
1. 偵測變更
2. 重新部署網站到 GitHub Pages
3. 更新 `qwerboy.com` 的內容（透過 Cloudflare CDN 快取）

**注意**：Cloudflare 會快取內容，更新可能需要幾分鐘才會在網站上看到。

## 🚀 清除 Cloudflare 快取（當內容更新時）

如果更新後看不到變更，可能需要清除 Cloudflare 快取：

1. 在 Cloudflare Dashboard，選擇 `qwerboy.com` 域名
2. 點擊左側選單的 **Caching** → **Configuration**
3. 點擊 **Purge Everything** → **Purge Everything**
4. 等待 1-2 分鐘讓快取清除

## 📝 常見問題

### Q: DNS 設定後多久會生效？
A: Cloudflare 通常很快，5-30 分鐘內。其他 DNS 服務可能需要最多 48 小時。

### Q: 為什麼要使用 4 個 A Record？
A: GitHub Pages 使用多個 IP 位址以提供高可用性。設定多個 A Record 可以實現負載平衡。

### Q: Proxy status 應該選 Proxied 還是 DNS only？
A: 建議使用 **Proxied**（橘色雲朵），這樣可以：
- 使用 Cloudflare 的 CDN 加速
- 自動獲得 SSL 憑證
- 受到 DDoS 保護
- 隱藏真實 IP 位址

### Q: 如何強制重新部署？
A: 在 GitHub repository → **Actions** → 選擇最新的 workflow → **Re-run jobs**

### Q: 如何查看部署日誌？
A: 在 GitHub repository → **Actions** → 點擊特定的 workflow run → 查看 **Deploy to GitHub Pages** 步驟的日誌

### Q: GitHub Pages 顯示 "Custom domain is not verified"？
A: 這通常表示 DNS 記錄尚未正確設定。請確認：
1. DNS 記錄已正確設定在 Cloudflare
2. 等待 DNS 傳播完成（使用 dnschecker.org 檢查）
3. 在 GitHub Pages 設定中重新輸入域名

### Q: 如何自訂 404 頁面？
A: 在專案根目錄建立 `404.html` 檔案即可。GitHub Pages 會自動使用它。

### Q: Cloudflare SSL 顯示 "Not secure"？
A: 請確認：
1. SSL/TLS 模式設為 **Full (strict)** 或 **Full**
2. 等待 SSL 憑證自動產生（通常 1-5 分鐘）
3. 確認 GitHub Pages 的 Custom domain 設定正確

## 🔒 安全性建議

1. **啟用 Cloudflare 的 DDoS 保護**（預設已啟用）
2. **使用 HTTPS**（Cloudflare 自動提供 SSL）
3. **啟用 Always Use HTTPS**（透過 Page Rules）
4. **定期更新內容**（GitHub Actions 自動部署）
5. **檢查 Cloudflare 的安全設定**（Security → Settings）

## 📚 相關資源

- [GitHub Pages 文件](https://docs.github.com/en/pages)
- [Cloudflare DNS 文件](https://developers.cloudflare.com/dns/)
- [Cloudflare SSL/TLS 文件](https://developers.cloudflare.com/ssl/)
- [GitHub Actions 文件](https://docs.github.com/en/actions)

## 🎯 快速檢查清單

部署完成後，請確認：

- [ ] GitHub repository 已建立並推送程式碼
- [ ] GitHub Pages 已啟用並可訪問（`https://qwerboy-design.github.io/Personal-website-for-qwerboy.com/`）
- [ ] Cloudflare 已添加 `qwerboy.com` 域名
- [ ] DNS 記錄已正確設定（4 個 A Record 或 CNAME）
- [ ] Proxy status 設為 Proxied（橘色雲朵）
- [ ] GitHub Pages 的 Custom domain 已設定為 `qwerboy.com`
- [ ] Cloudflare SSL/TLS 模式設為 Full (strict)
- [ ] `https://qwerboy.com` 可以正常訪問
- [ ] HTTPS 憑證正確（瀏覽器顯示鎖頭）

---

**部署完成後，您的網站將在 `https://qwerboy.com` 上線！** 🎉
