# Cloudflare DNS 設定快速指南

## 📍 在 Cloudflare 設定 DNS 記錄

### 步驟 1: 進入 DNS 設定頁面

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 選擇 `qwerboy.com` 域名
3. 點擊左側選單的 **DNS** → **Records**

### 步驟 2: 添加 A Records（根域名）

點擊 **Add record**，依序添加以下 4 筆 A Record：

**Record 1:**
```
Type: A
Name: @
IPv4 address: 185.199.108.153
Proxy status: Proxied (橘色雲朵) ⚠️ 重要！
TTL: Auto
```

**Record 2:**
```
Type: A
Name: @
IPv4 address: 185.199.109.153
Proxy status: Proxied (橘色雲朵)
TTL: Auto
```

**Record 3:**
```
Type: A
Name: @
IPv4 address: 185.199.110.153
Proxy status: Proxied (橘色雲朵)
TTL: Auto
```

**Record 4:**
```
Type: A
Name: @
IPv4 address: 185.199.111.153
Proxy status: Proxied (橘色雲朵)
TTL: Auto
```

### 步驟 3: 添加 CNAME Record（www 子域名，可選）

**Record 5:**
```
Type: CNAME
Name: www
Target: YOUR_USERNAME.github.io  (例如：如果您的 GitHub 帳號是 qwerboy，則填入 qwerboy.github.io)
Proxy status: Proxied (橘色雲朵)
TTL: Auto
```

**說明**：`YOUR_USERNAME.github.io` 需要替換為您的實際 GitHub 使用者名稱。
- 例如：如果您的 GitHub 帳號是 `qwerboy`，則填入 `qwerboy.github.io`
- 例如：如果您的 GitHub 帳號是 `mikeliou`，則填入 `mikeliou.github.io`
- 您可以在 GitHub 右上角點擊頭像，查看您的使用者名稱

### 步驟 4: 設定 SSL/TLS

1. 點擊左側選單的 **SSL/TLS**
2. 在 **Overview** 頁面，選擇 **Full (strict)**
3. 等待 1-5 分鐘讓 SSL 憑證自動產生

### 步驟 5: 驗證設定

完成後，您的 DNS 記錄應該看起來像這樣：

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | 185.199.108.153 | 🟠 Proxied |
| A | @ | 185.199.109.153 | 🟠 Proxied |
| A | @ | 185.199.110.153 | 🟠 Proxied |
| A | @ | 185.199.111.153 | 🟠 Proxied |
| CNAME | www | YOUR_USERNAME.github.io | 🟠 Proxied |

## ⚠️ 重要提醒

1. **Proxy status 必須是 Proxied（橘色雲朵）**，不是 DNS only（灰色雲朵）
2. 設定完成後等待 5-30 分鐘讓 DNS 傳播
3. 使用 [dnschecker.org](https://dnschecker.org) 檢查 DNS 傳播狀態
