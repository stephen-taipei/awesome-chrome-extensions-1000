# Tab Groups Plus

> 增強版標籤群組管理 - 自動分組、群組範本、一鍵收合展開

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 功能特色

- **自動分組**: 依網域自動將標籤分組，快速整理雜亂的標籤
- **群組範本**: 儲存目前的群組配置為範本，方便日後快速套用
- **一鍵收合/展開**: 快速收合或展開所有群組
- **顏色自訂**: 9 種群組顏色可供選擇
- **即時管理**: 直接在 Popup 中管理群組與標籤
- **未分組標籤**: 快速查看未分組的標籤並加入群組
- **鍵盤快捷鍵**: 支援快捷鍵快速操作

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

### 自動分組
點擊「自動分組」按鈕，擴充功能會自動依據網域將標籤分組：
- 相同網域的標籤會被歸類到同一群組
- 群組名稱會自動設定為網域名稱
- 至少需要 2 個相同網域的標籤才會建立群組

### 群組管理
- **點擊群組標題**: 收合/展開群組
- **編輯按鈕**: 修改群組名稱
- **解散按鈕**: 將群組內的標籤解散（不關閉標籤）
- **刪除按鈕**: 刪除群組並關閉所有標籤

### 群組範本
1. 整理好群組配置後，切換到「範本」標籤
2. 點擊「儲存目前群組為範本」
3. 輸入範本名稱並儲存
4. 日後可一鍵套用已儲存的範本

### 鍵盤快捷鍵
| 快捷鍵 | 功能 |
|--------|------|
| `Ctrl+Shift+G` (Mac: `Cmd+Shift+G`) | 自動分組所有標籤 |
| `Ctrl+Shift+C` (Mac: `Cmd+Shift+C`) | 收合所有群組 |

### 設定選項
- **啟用自動分組**: 開啟後會自動監控標籤變化
- **新標籤自動加入群組**: 新開的標籤會自動加入相符的群組
- **建立群組時自動收合**: 新建群組時自動收合

---

## 權限說明

| 權限 | 用途 | 風險程度 |
|------|------|----------|
| `tabs` | 讀取標籤資訊（標題、URL）| 中 |
| `tabGroups` | 建立與管理標籤群組 | 低 |
| `storage` | 儲存設定與範本 | 極低 |

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
- `chrome.tabGroups` - 標籤群組管理
- `chrome.storage` - 本地儲存
- `chrome.runtime` - 訊息傳遞
- `chrome.commands` - 鍵盤快捷鍵

---

## 檔案結構

```
002-tab-groups-plus/
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

## 群組顏色

支援 Chrome 原生的 9 種群組顏色：

| 顏色 | 英文名稱 |
|------|----------|
| 灰色 | grey |
| 藍色 | blue |
| 紅色 | red |
| 黃色 | yellow |
| 綠色 | green |
| 粉紅 | pink |
| 紫色 | purple |
| 青色 | cyan |
| 橘色 | orange |

---

## 開發筆記

### Manifest V3 適配
- 使用 Service Worker 取代 Background Page
- 使用 `chrome.tabGroups` API (Chrome 89+)
- 遵循 CSP 規範

### 自動分組邏輯
1. 取得當前視窗所有標籤
2. 依網域分類標籤（移除 www. 前綴）
3. 對有 2 個以上標籤的網域建立群組
4. 自動產生群組標題與顏色

---

## 更新日誌

### v1.0.0 (2024-12-01)
- 初始版本發布
- 自動依網域分組功能
- 群組範本支援
- 收合/展開所有群組
- 群組顏色自訂
- 深色模式支援

---

## 授權

MIT License - 詳見專案根目錄 LICENSE 文件
