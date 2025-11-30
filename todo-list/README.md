# 📝 Todo List - 待办事项管理应用

一个功能丰富、界面美观的待办事项管理应用，基于 Next.js 16 构建。

## ✨ 功能特性

### 用户系统
- 用户名注册/登录
- 游客模式体验
- 积分系统

### 任务管理
- 创建、编辑、删除任务
- 设置任务优先级（紧急/高/中/低）
- 设置截止日期和具体时间（精确到小时）
- 任务分类管理
- 任务完成状态切换

### 首页仪表盘
- 只显示当天任务
- 按优先级排序视图
- 按时间排序视图
- 支持升序/降序切换
- 分类筛选

### 任务列表
- 显示所有任务
- 多条件搜索筛选
  - 关键词搜索
  - 优先级筛选
  - 分类筛选
  - 时间范围筛选（今天/本周/本月/自定义）
  - 显示/隐藏已完成任务

### 日历视图
- 月历展示
- 点击日期查看当天任务
- 过去日期只能查看历史，不能添加任务
- 支持在日历中添加和编辑任务

### 分类管理
- 创建自定义分类
- 自定义分类颜色
- 编辑和删除分类

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand (带持久化)
- **数据库**: MySQL + Prisma ORM
- **图标**: Lucide React
- **密码加密**: bcryptjs

## 📦 安装与运行

### 环境要求
- Node.js 18+
- MySQL 数据库

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/lcsy1234/day_todo.git
cd day_todo/todo-list
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
# 创建 .env 文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接
DATABASE_URL="mysql://用户名:密码@localhost:3306/数据库名"
```

4. 初始化数据库
```bash
npx prisma generate
npx prisma db push
```

5. 启动开发服务器
```bash
npm run dev
```

6. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
todo-list/
├── prisma/
│   └── schema.prisma      # 数据库模型定义
├── src/
│   ├── app/
│   │   ├── api/           # API 路由
│   │   │   ├── auth/      # 认证相关
│   │   │   ├── todos/     # 任务 CRUD
│   │   │   └── categories/# 分类 CRUD
│   │   ├── dashboard/     # 仪表盘页面
│   │   │   ├── page.tsx   # 首页
│   │   │   ├── tasks/     # 任务列表
│   │   │   ├── calendar/  # 日历视图
│   │   │   └── profile/   # 个人中心
│   │   └── page.tsx       # 登录页
│   ├── components/        # 组件
│   │   ├── ui/            # 基础 UI 组件
│   │   ├── TodoEditor.tsx # 任务编辑器
│   │   ├── Calendar.tsx   # 日历组件
│   │   ├── CategoryManager.tsx # 分类管理
│   │   └── ...
│   ├── lib/               # 工具库
│   └── store/             # Zustand 状态管理
└── ...
```

## 🎨 界面预览

- 登录/注册页面
- 今日任务仪表盘
- 任务搜索列表
- 日历视图
- 分类管理

## 📄 开源协议

MIT License
