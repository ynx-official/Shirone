## 可复用的接口示例

这段文字来自独立的 Markdown 文件。

<!-- #region public-api -->
```ts
export function greet(name: string) {
  return `你好，${name}！`;
}
```
<!-- #endregion public-api -->

公共片段可以集中维护，再由文章按需引用。
