# 徐诚的个人网站

这是 [xyk-865.github.io](https://xyk-865.github.io/) 的源代码，内容聚焦于个人文章、旅行与生活影像、作品展示。

网站文件位于 `site/`，推送到 `main` 后由 GitHub Actions 自动发布到 `gh-pages`。

## 发布文章

文章列表维护在 `site/posts.js`。每篇文章包含标题、日期、摘要和 `tags` 数组；一篇文章可以选择多个标签，博客页面会自动生成标签筛选。
