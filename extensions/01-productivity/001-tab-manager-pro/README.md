# Tab Manager Pro

> 全功能標籤管理器 - 搜尋、排序、群組、快速切換標籤

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 功能特色

- **快速搜尋**: 即時搜尋標籤標題與網址，支援模糊匹配
- **多視窗管理**: 同時管理所有視窗的標籤
- **排序功能**: 依標題、網域或最近使用排序
- **拖拽排序**: 直接拖拽標籤重新排列順序
- **鍵盤導航**: 完整的鍵盤快捷鍵支援
- **釘選管理**: 快速釘選/取消釘選標籤
- **批次關閉**: 一鍵關閉其他標籤
- **深色模式**: 自動適應系統主題

---

## 安裝方式

### 開發者模式安裝

1. 下載此資料夾
2. 開啟 Chrome，前往 `chrome://extensions/`
3. 開啟右上角「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇此擴充功能資料夾

---

## 使用方式

### 開啟 Tab Manager Pro
- 點擊工具列圖示
- 或使用快捷鍵 `Ctrl+Shift+T` (Mac: `Cmd+Shift+T`)

### 搜尋標籤
在搜尋框輸入關鍵字，即時過濾顯示匹配的標籤。

### 鍵盤快捷鍵
| 快捷鍵 | 功能 |
|--------|------|
| `↑` / `↓` | 上下導航選擇標籤 |
| `Enter` | 切換到選中的標籤 |
| `Delete` / `Backspace` | 關閉選中的標籤 |
| `Escape` | 清除搜尋或關閉視窗 |

### 標籤操作
- **點擊標籤**: 切換到該標籤
- **釘選按鈕**: 釘選/取消釘選標籤
- **關閉按鈕**: 關閉標籤
- **拖拽標籤**: 重新排列順序

### 排序選項
點擊排序按鈕選擇排序方式：
- 預設順序
- 依標題排序
- 依網域排序
- 依最近使用排序

---

## 權限說明

| 權限 | 用途 | 風險程度 |
|------|------|----------|
| `tabs` | 讀取標籤資訊（標題、URL、狀態）| 中 |
| `storage` | 儲存使用者設定 | 極低 |

### 隱私聲明
- 所有資料僅儲存在本地
- 不會傳送任何資料到外部伺服器
- 不收集任何使用者資訊

---

## 技術規格

| 項目 | 內容 |
|------|------|
| Manifest 版本 | V3 |
| 最低 Chrome 版本 | 116 |
| 程式語言 | JavaScript (ES6+) |
| UI 框架 | Vanilla JS |
| 儲存方式 | Chrome Storage API |

### 使用的 Chrome API
- `chrome.tabs` - 標籤管理
- `chrome.windows` - 視窗管理
- `chrome.tabGroups` - 標籤群組
- `chrome.storage` - 本地儲存
- `chrome.runtime` - 訊息傳遞
- `chrome.commands` - 鍵盤快捷鍵

---

## 檔案結構

```
001-tab-manager-pro/
├── manifest.json      # 擴充功能配置
├── background.js      # Service Worker
├── popup.html         # Popup 介面
├── popup.css          # Popup 樣式
├── popup.js           # Popup 邏輯
├── icons/
│   ├── icon16.png     # 16x16 圖示
│   ├── icon48.png     # 48x48 圖示
│   └── icon128.png    # 128x128 圖示
└── README.md          # 說明文件
```

---

## 開發筆記

### Manifest V3 適配
- 使用 Service Worker 取代 Background Page
- 使用 `chrome.storage` 取代 `localStorage`
- 遵循 CSP 規範，無 `eval()` 使用

### 效能優化
- 虛擬列表設計（適用於大量標籤）
- 事件委派減少監聽器數量
- 非同步載入避免阻塞

---

## 更新日誌

### v1.0.0 (2024-12-01)
- 初始版本發布
- 基本標籤管理功能
- 搜尋、排序、拖拽排序
- 鍵盤導航支援
- 深色模式支援

---

## 授權

MIT License - 詳見專案根目錄 LICENSE 文件
