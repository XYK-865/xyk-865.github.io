# Personal OS 与人生项目维护

这三项是现有个人网站的项目页，沿用原生 HTML/CSS/JavaScript、共享导航、主题和搜索；没有新增框架或独立站点。

## 页面

- `projects.html`：三项个人项目入口，保留原有深空视觉、Bilibili 与 GitHub 入口。
- `personal-os.html`：人生元系统完整正文，八大领域、十二母题、知识升级、行动反馈与六个空白模板。
- `decision-model.html`：独立的判断与退出模型，四宫格、退出合约、九问、目录和原稿下载。
- `life-checklist.html`：七类生活主题、28 条初始查阅入口，支持分类、搜索、锚点、来源和复盘问题。

## 修改与生成

正文的唯一来源：`site/assets/personal-os/content/personal-os.md` 与 `decision-model.md`。版本和更新时间写在文件头；不要直接修改生成的 HTML 正文。

清单数据：`site/assets/personal-os/checklist.json`，每条沿用稳定的 `id`、`category`、`title`、`summary`、`reflection`、`sourceURL`、`sourceTitle`；`sourceSnapshotURL` 与 `attribution.snapshot` 留下本次来源版本。新增主题先补数据，再生成网页。

在仓库根目录执行：

```text
python build-life-projects.py
```

生成器仅使用 Python 标准库，重建三个项目页并更新 `site/search-index.json` 中属于本模块的条目，保留现有博客、健身和旅行搜索条目。修改主要章节结构时同时检查脚本中的稳定锚点列表；生成器会在章节数量变化时停止。

`site/assets/personal-os/life-projects.css` 与 `life-projects.js` 负责独立页；`project-cards.css` 仅作用于项目页新增分区。原有共享样式没有修改。

## 内容与数据

两份用户提供的公开 Markdown 与压缩包 public 版本逐字节一致。保留原稿的版本、日期与限定说明；健身场所例子仍标为历史结构示例，不包装成已执行结果。包中的 `examples/private/`、开发指令和整个压缩包未进入发布文件。

六份模板是未填写的框架，下载后默认标记 private。此版本是资料阅读和模板工具，没有个人记录的网页保存、账户或云同步。

清单参考 eternity4719 / HowToLiveBetter 项目贡献者的「高性价比人生指南」，按 CC BY 4.0 使用正文主题，重新分类并撰写摘要与复盘问题；公开页保留原项目、许可、改编说明与每条来源。未复制原项目完整正文、证据等级或量化收益。快照：`e2605d3e2242bd6216c9255192b8a8957a08c55a`，整理日期 2026-11-01。

日后新增实际案例时，先审核是否适合公开，再决定进入网页；不会从下载目录或私人案例目录自动扫描导入。
