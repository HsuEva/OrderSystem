## Why

目前團隊訂餐多依賴手動整理試算表，容易出現漏單、重複與統計錯誤，特別是飲料的甜度與冰塊組合常被遺漏，導致實際下單與同事填寫內容不一致。現在需要一個可快速建立本次菜單、集中收單並自動統計的工具，以降低人工整理成本與出錯率。

## What Changes

- 新增「同事名單全局管理」，主辦人可新增、修改、刪除同事名單。
- 新增「本次菜單配置」功能，使用者可自訂餐點與飲料品項。
- 新增「多人填寫表單」流程，支援一次分享給多位同事填寫；同事從預設名單中選取身份（避免重名與拼寫差異）。
- 新增「截止時間」設定，活動可在指定時間後自動停止收單。
- 新增「訂單統計」功能，自動彙總每個餐點的數量。
- 新增「飲料細項統計」功能，將飲料與甜度、冰塊組合一併統計（例如：紅茶 / 半糖 / 少冰）。
- 新增「CSV 匯出」功能，支援匯出原始訂單與統計結果。
- 新增基本資料驗證，避免重複提交與缺漏必要欄位。

## Capabilities

### New Capabilities
- `colleague-roster-management`: 全局維護同事名單，主辦人可管理填單人員清單。
- `dynamic-menu-management`: 建立與維護單次訂餐的餐點、飲料、甜度與冰塊選項。
- `team-order-form-collection`: 提供可分享給多人填寫的訂單表單，同事從預設名單選取身份並提交訂單。
- `order-summary-with-drink-options`: 統計餐點數量，並依「飲料 + 甜度 + 冰塊」組合產生彙總結果。

### Modified Capabilities
- 無

## Impact

- Affected artifacts:
  - openspec/specs/colleague-roster-management/spec.md
  - openspec/specs/dynamic-menu-management/spec.md
  - openspec/specs/team-order-form-collection/spec.md
  - openspec/specs/order-summary-with-drink-options/spec.md
  - openspec/changes/team-order-form-and-summary/design.md
  - openspec/changes/team-order-form-and-summary/tasks.md
- 預期實作會涉及前端表單頁、後端資料儲存與統計邏輯。
- 需要定義資料模型（品項、訂單、飲料客製選項）與統計輸出格式。