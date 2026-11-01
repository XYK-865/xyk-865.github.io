# Personal OS 与人生项目维护

这三项是现有个人网站的项目页，沿用原生 HTML/CSS/JavaScript、共享导航、主题和搜索；没有新增框架或独立站点。

## 页面

- `projects.html`：三项个人项目入口，保留原有深空视觉、Bilibili 与 GitHub 入口。
- `personal-os.html`：人生元系统的分支总览，可在分类卡片、树形目录和知识网络间切换；完整正文、八大领域、十二母题与六个空白模板保留在核心说明中。
- `decision-model.html`：按选择前、行动中、复盘后组织判断工具；原稿中的四宫格、退出合约和九问仍可完整阅读、复制和下载。
- `life-checklist.html`：按七类生活主题组织分支，完整清单保留28条初始主题、来源和复盘问题。
- `project-branch.html?project=personal-os&branch=os-health`：通用分支详情页示例。`project` 指项目 ID，`branch` 指节点 ID；页面显示所在层级、子分支、已有资料、复盘问题和关联分支。

三个项目的完整说明可通过 `?view=guide` 打开，例如 `decision-model.html?view=guide#exit-contract`。原有锚点链接也保持可用，例如 `personal-os.html#D05` 会自动展开核心说明并定位到健康领域。项目总览的视图链接分别使用 `?view=cards`、`?view=tree` 与 `?view=network`。

## 修改与生成

正文的唯一来源：`site/assets/personal-os/content/personal-os.md` 与 `decision-model.md`。版本和更新时间写在文件头；不要直接修改生成的 HTML 正文。

清单数据：`site/assets/personal-os/checklist.json`，每条沿用稳定的 `id`、`category`、`title`、`summary`、`reflection`、`sourceURL`、`sourceTitle`；`sourceSnapshotURL` 与 `attribution.snapshot` 留下本次来源版本。新增主题先补数据，再生成网页。

分支结构的统一来源：`site/assets/personal-os/project-structure.json`。它包含 `projects`、`nodes` 和 `relations`，三种浏览视图和通用分支详情页都读取同一份数据。现有52个节点（13组、39分支）、82处已有资源引用和16条跨项目关系，不需要在卡片、树和网络里分别维护三套内容。

在仓库根目录执行：

```text
python build-life-projects.py
```

生成器仅使用 Python 标准库，重建三个项目页及通用分支页面，并更新 `site/search-index.json` 中属于本模块的条目，保留现有博客、健身和旅行搜索条目。构建时验证节点ID唯一、项目归属、父子同项目与无环、资源文件和原稿锚点、关系端点，并为当前52个节点生成指向详情页的搜索条目。修改主要章节结构时同时检查脚本中的稳定锚点列表；生成器会在章节数量变化时停止。

`site/assets/personal-os/life-projects.css` 与 `life-projects.js` 负责独立页；`project-cards.css` 仅作用于项目页新增分区。原有共享样式没有修改。

`project-hub.css` 与 `project-hub.js` 负责三视图、检索筛选、分支详情和核心说明的展开；`project-graph.css` 与 `project-graph.js` 负责关系网络。它们沿用站点的明暗主题与导航。

## 新增或细分分支

`nodes` 中每条节点的 `projectId` 关联一个已有项目；`parentId: null` 是项目内的根分类。`parentId` 可以指向同项目中的任意已有节点，不限制为两层，也不要求父节点必须是 `kind: group`。因此一个现有分支可以继续长出子分支，旧资源、旧URL和原有链接不必搬走。

以下是一条可追加到 `nodes` 的最小完整示例；它展示如何在现有健康分支 `os-health` 下继续细分，尚未作为真实节点写入数据：

```json
{
  "id": "os-health-sleep-notes",
  "projectId": "personal-os",
  "parentId": "os-health",
  "title": "睡眠与恢复",
  "summary": "围绕作息与恢复整理阅读线索和待验证的问题。",
  "kind": "branch",
  "status": "seed",
  "prompts": [
    "我想先弄清哪一个作息问题？",
    "什么记录可以帮助我判断安排是否适合自己？"
  ],
  "resources": [
    {
      "id": "os-health-sleep-core",
      "title": "健康领域说明",
      "summary": "先回看现有原稿中的领域定位。",
      "href": "personal-os.html?view=guide#D05",
      "type": "核心说明"
    }
  ],
  "relatedIds": []
}
```

新增后运行构建，分支会同步出现在分类卡片、树形目录、网络和站内搜索。详情地址为 `project-branch.html?project=personal-os&branch=os-health-sleep-notes`，不必为每个分支复制一个HTML文件。

维护时遵守以下约定：

- **稳定ID**：`id` 是链接和关系的依据，修改中文标题时不要改ID。节点ID与每个资源ID应保持唯一；`parentId` 和 `relatedIds` 只能引用已有节点，避免循环父子关系。
- **资源与正文分离**：`resources` 保存入口而非复制正文，字段为 `id`、`title`、`summary`、`href`、`type`。`type` 目前使用“核心说明”“模板”“清单主题”；链接只能指向真实现有文件与有效锚点。原稿用 `?view=guide#锚点`，模板用实际下载路径；同一原稿可以由多个分支引用。
- **先有内容，再加链接**：新分支可以用现有原稿或空白模板作为起点，并标明为 `seed`。尚未写成的文章或个人案例不要填入虚假的资源链接，也不要写成“已经完成”的记录。
- **关系与层级分离**：父子包含关系由 `parentId` 负责；跨分支的应用、参考和反馈由 `relations` 负责，不借用父子关系表达跨项目关联。
- **维护网络关联**：在 `relations` 增加 `{ "source": "os-health-sleep-notes", "target": "check-health-routine", "label": "联系作息资料", "type": "informs" }`。`type` 使用 `applies`、`informs` 或 `feedback`；中文 `label` 说明两者具体如何关联。再把两端节点ID分别加入对方的 `relatedIds`，保持网络和详情页的关联入口一致。
- **先检验再发布**：构建通过后核对三视图、详情面包屑、原稿锚点与搜索结果；新增私人材料需要先审核公开范围，不会自动进入这份公开结构数据。

## 内容与数据

两份用户提供的公开 Markdown 与压缩包 public 版本逐字节一致。保留原稿的版本、日期与限定说明；健身场所例子仍标为历史结构示例，不包装成已执行结果。包中的 `examples/private/`、开发指令和整个压缩包未进入发布文件。

六份模板是未填写的框架，下载后默认标记 private。此版本是资料阅读和模板工具，没有个人记录的网页保存、账户或云同步。

清单参考 eternity4719 / HowToLiveBetter 项目贡献者的「高性价比人生指南」，按 CC BY 4.0 使用正文主题，重新分类并撰写摘要与复盘问题；公开页保留原项目、许可、改编说明与每条来源。未复制原项目完整正文、证据等级或量化收益。快照：`e2605d3e2242bd6216c9255192b8a8957a08c55a`，整理日期 2026-11-01。

日后新增实际案例时，先审核是否适合公开，再决定进入网页；不会从下载目录或私人案例目录自动扫描导入。
