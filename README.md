# Mike Liu Personal Website

**🌐 [qwerboy.com](https://qwerboy.com)**

> 劉祥弘個人品牌網站 - 採用混合式 Spatial Bento 設計系統，結合報紙美學與現代科技感互動。

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://qwerboy.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 關於本專案

這是劉祥弘（Mike Liu）的個人品牌網站。Mike 是一位擁有 16 年以上經驗的**資深系統分析師**，專長於 AI 技術（特別是醫療影像 AI）與 API 架構設計，同時也是一位熱愛旅行與咖啡的開發者。

網站採用現代化的 Bento Grid 佈局，融合了溫暖的「報紙美學」配色與動態的互動效果，旨在打造一個既專業又具個人溫度的數位名片。

### 主要特色

- **🎨 報紙美學設計系統**：採用溫暖的紙張色調與襯線字體，搭配精緻的紙張紋理（Noise Texture）。
- **✨ 動態互動效果**：
  - **動能排版 (Kinetic Typography)**：Hero 標題文字粗細隨頁面捲動動態變化。
  - **3D 傾斜效果**：所有卡片均支援滑鼠感應的 3D 傾斜。
  - **毛玻璃質感**：卡片背景具備細緻的 `20px` 模糊處理。
- **📱 完全響應式設計**：完美支援移動端與桌面端。
- **🚀 本地化履歷整合**：內建基於 PDF 履歷內容開發的互動式 Modal。

## 技術架構

### 核心技術

- **HTML5**：語意化結構與 Open Graph / Twitter Card SEO 優化。
- **CSS3**：原生 CSS Grid 佈局、CSS 變數主題系統、Backdrop Filter 毛玻璃技術。
- **JavaScript (ES6+)**：
  - 自定義捲動監聽器（Scroll Listeners）實作動能排版。
  - 動態 Modal 切換系統。
  - 隨機淡入動畫效果。

### 第三方函式庫

- [Vanilla Tilt.js](https://micku7zu.github.io/vanilla-tilt.js/) - 3D 傾斜效果。
- [Font Awesome](https://fontawesome.com/) - 豐富的圖標系統。
- [Google Fonts](https://fonts.google.com/) - 字型支援（Inter, Noto Sans TC, Noto Serif TC, Playfair Display）。

## 設計系統

### 色彩配置 (Newspaper Aesthetic)

- **背景色**：`#F5F2EB` - 溫暖的米白紙張色。
- **卡片背景**：`rgba(255, 255, 255, 0.7)` - 高模糊毛玻璃。
- **強調色**：`#C41E3A`（編輯紅）、`#3B82F6`（科技藍）。
- **主要文字**：`#1A1A1A` - 接近報紙油墨的深黑色。

### 佈局配置

| 區塊 | 尺寸 | 內容 |
|------|------|------|
| **Hero Card** | 2×2 | 專業照片 + 姓名「劉祥弘 Mike Liu」 |
| **Social Card** | 1×1 | Facebook 連結 (@Mike0725) |
| **About/Resume** | 1×1 | 個人簡介與互動式履歷入口 |
| **Identity Card** | 2×1 | 資深系統分析師專業技能（AI/API） |
| **Coffee Card** | 2×1 | Mike's Coffee 專案入口 |
| **Blog Card** | 2×1 | Mike's Blog 部落格文章精選 |
| **Trait Cards** | 3×1 | 旅行者、開發者、咖啡愛好者特質 |
| **Venture Cards** | 3×1 | 日本旅遊、紐約城市、瑞士格林德瓦 |

## 本地開發

### 快速開始

1. **Clone 專案**
```bash
git clone https://github.com/qwerboy/2026-personal-website.git
cd 2026-personal-website
```

2. **啟動伺服器**
```bash
python -m http.server 8000
```

3. **訪問頁面**
開啟瀏覽器訪問 `http://localhost:8000`

## 授權條款

本專案採用 MIT License 授權。

## 作者

**劉祥弘 Mike Liu**

- 網站：[qwerboy.com](https://qwerboy.com)
- Facebook：[劉祥弘](https://www.facebook.com/Mike0725/)
- 部落格：[麥克愛旅行](https://blog.qwerboy.com)
