---
title: Mermaid 图表示例集
published: 2024-05-02T00:00:00.000Z
description: 用流程、关系、排期和数据图表说明复杂信息。
tags:
  - 示例
  - Markdown
  - Mermaid
category: 示例
lang: zh_CN
draft: false
---

Mermaid 将文本描述转换为图表。下面保留了常见图表类型，适合说明流程、数据关系、排期和阅读路径。

## 流程图

```mermaid
flowchart TD
    accTitle: 流程图示例
    accDescr: 使用流程图说明博客中的信息关系与工作过程。
    Draft[编写文章] --> Check{检查通过？}
    Check -->|否| Revise[修改内容]
    Revise --> Check
    Check -->|是| Preview[本地预览]
    Preview --> Build[生成页面]
    Build --> Publish[发布]
```

## 时序图

```mermaid
sequenceDiagram
    accTitle: 时序图示例
    accDescr: 使用时序图说明博客中的信息关系与工作过程。
    actor Reader as 读者
    participant Browser as 浏览器
    participant Swup as 路由器
    participant Content as 文章区域
    participant Renderer as 图表渲染器
    Reader->>Browser: 打开另一篇文章
    Browser->>Swup: 开始站内导航
    Swup->>Content: 替换页面内容
    Swup-->>Renderer: 通知页面更新
    Renderer->>Content: 查找图表容器
    Renderer-->>Browser: 插入主题图表
```

## 实体关系图

```mermaid
erDiagram
    accTitle: 实体关系图示例
    accDescr: 使用实体关系图说明博客中的信息关系与工作过程。
    AUTHOR ||--o{ POST : 撰写
    POST ||--o{ COMMENT : 收到
    POST ||--o{ POST_TAG : 关联
    TAG ||--o{ POST_TAG : 分组
    AUTHOR {
        string id PK
        string display_name
    }
    POST {
        string slug PK
        string title
        datetime published_at
        string author_id FK
    }
    COMMENT {
        string id PK
        string post_slug FK
        string body
    }
    TAG {
        string id PK
        string label
    }
    POST_TAG {
        string post_slug FK
        string tag_id FK
    }
```

## 类图

```mermaid
classDiagram
    accTitle: 类图示例
    accDescr: 使用类图说明博客中的信息关系与工作过程。
    class ContentPipeline {
        +render(markdown)
        +collectMetadata()
    }
    class MermaidPlugin {
        +transform(codeFence)
        +createFallback()
    }
    class DiagramRenderer {
        +initialize()
        +renderAll()
        +refreshTheme()
    }
    class ThemeTokens {
        +primary
        +surface
        +outline
    }
    ContentPipeline --> MermaidPlugin : 使用
    DiagramRenderer --> MermaidPlugin : 增强输出
    DiagramRenderer --> ThemeTokens : 读取
```

## 状态图

```mermaid
stateDiagram-v2
    accTitle: 状态图示例
    accDescr: 使用状态图说明博客中的信息关系与工作过程。
    state "草稿" as Draft
    state "审核中" as InReview
    state "已发布" as Published
    state "已归档" as Archived
    [*] --> Draft
    Draft --> InReview : 提交
    InReview --> Draft : 请求修改
    InReview --> Published : 通过
    Published --> Draft : 撤回
    Published --> Archived : 归档
    Archived --> [*]
```

## 趋势图

```mermaid
xychart-beta
    accTitle: 趋势图示例
    accDescr: 使用趋势图说明博客中的信息关系与工作过程。
    title "六周内容表现"
    x-axis "周次" [1, 2, 3, 4, 5, 6]
    y-axis "相对数值" 0 --> 100
    bar [36, 52, 44, 68, 76, 84]
    line [48, 55, 62, 61, 73, 81]
```

## 饼图

```mermaid
pie showData
    accTitle: 饼图示例
    accDescr: 使用饼图说明博客中的信息关系与工作过程。
    title 文章主题占比
    "工程实践" : 40
    "设计系统" : 25
    "使用指南" : 20
    "生活随笔" : 15
```

## 甘特图

```mermaid
gantt
    accTitle: 甘特图示例
    accDescr: 使用甘特图说明博客中的信息关系与工作过程。
    title 主题发布计划
    dateFormat YYYY-MM-DD
    axisFormat %m/%d
    section 设计
    确认需求 :done, brief, 2024-05-06, 2d
    细化交互 :done, interaction, after brief, 3d
    section 实现
    开发组件 :active, components, after interaction, 6d
    编写示例 :examples, after interaction, 4d
    section 验证
    自动化测试 :tests, after components, 3d
    发布 :milestone, release, after tests, 0d
```

## 思维导图

```mermaid
mindmap
  root((Shirone))
    内容体验
      Markdown
      搜索
      图表
    界面系统
      M3E 令牌
      响应式布局
      主题配色
    工程质量
      类型检查
      Playwright
      无障碍
```

## 时间线

```mermaid
timeline
    title 图表支持的演进
    处理流程设计 : 检测图表代码块
                    : 保留源码回退
    客户端增强 : 按需加载运行时
                       : 应用主题令牌
    可靠性 : 支持站内导航
                : 验证响应式和无障碍输出
```

## 用户旅程

```mermaid
journey
    accTitle: 用户旅程示例
    accDescr: 使用用户旅程说明博客中的信息关系与工作过程。
    title 阅读技术文章的过程
    section 发现
      浏览文章列表: 4: 读者
      选择主题: 5: 读者
    section 理解
      阅读正文: 4: 读者
      查看关系图: 5: 读者
    section 延伸
      打开相关文章: 4: 读者
      收藏页面: 3: 读者
```

## Git 分支图

```mermaid
gitGraph
    accTitle: Git 分支图示例
    accDescr: 使用Git 分支图说明博客中的信息关系与工作过程。
    commit id: "base"
    branch mermaid
    checkout mermaid
    commit id: "add-renderer"
    commit id: "add-tests"
    checkout main
    merge mermaid id: "merge-mermaid"
    commit id: "release"
```

## 看板

```mermaid
kanban
  backlog[待处理]
    docs[编写写作说明]
    examples[补充示例数据]
  active[进行中]
    themes[验证主题适配]
  complete[已完成]
    fallback[源码回退]
    rendering[客户端渲染]
```

## 桑基图

当前图表解析器的桑基图节点仅支持 ASCII，因此示例保留节点标识：Home（首页）、Discover（发现）、Read（阅读）、Explore（探索）、Theme（主题）、External（外部链接）。

```mermaid
sankey-beta
Home,Read,720
Discover,Read,430
Read,Explore,360
Read,Theme,210
Read,External,140
```

图表按文章实际需要加载。切换主题后会使用当前配色重新渲染，源码仍可作为无法运行图表时的回退内容。
