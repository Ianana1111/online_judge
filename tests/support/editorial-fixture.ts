export const editorialFixture = (slug = "editorial-fixture") => ({
  slug, title: "從輸入到輸出：一步一步理解", locale: "zh-TW" as const,
  bodyMd: ["題意與限制", "解題思路", "範例推演", "正確性", "複雜度", "常見錯誤"].map(h => `## ${h}\n\n` + "這是隔離測試的詳解內容，用來驗證發布、權限和過期控制，不代表正式題目的驗收證據。".repeat(4)).join("\n\n"),
  solutions: [{ languageKey: "cpp17" as const, sourceCode: "#include <iostream>\nint main() { int n; while (std::cin >> n) std::cout << n << '\\n'; }\n", explanationMd: "讀取一個整數後輸出相同的值；輸入失敗時離開迴圈。這段程式僅用於測試詳解元件與 API，並非正式發布內容。".repeat(4) }],
});
