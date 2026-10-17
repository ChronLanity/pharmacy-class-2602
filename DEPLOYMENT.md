# 药学2602班级网站 - Vercel部署指南

## 部署步骤

### 第一步：创建Supabase数据库（5分钟）

1. **注册/登录 Supabase**
   - 访问 [supabase.com](https://supabase.com)
   - 使用GitHub账号登录（推荐）

2. **创建新项目**
   - 点击 "New Project"
   - 项目名称：`药学2602班级网站` 或 `pharmacy-class-2602`
   - 设置数据库密码（**重要：请记录此密码**）
   - 选择区域：Northeast Asia (Tokyo) 或其他就近区域
   - 点击 "Create new project"
   - 等待1-2分钟创建完成

3. **获取数据库连接信息**
   - 进入项目后，点击左侧 "Settings" → "API"
   - 复制以下信息：
     - **Project URL**：`https://xxxxx.supabase.co`
     - **anon public key**：一长串字符串（以`eyJ...`开头）

4. **创建数据库表**
   - 点击左侧 "SQL Editor"
   - 点击 "New query"
   - 复制 `database-schema.sql` 文件的全部内容
   - 粘贴到SQL编辑器
   - 点击 "Run" 执行
   - 确认显示 "Success. No rows returned"

### 第二步：部署到Vercel（3分钟）

1. **准备GitHub仓库**
   ```bash
   # 在项目根目录执行
   git init
   git add .
   git commit -m "Initial commit - 药学2602班级网站"
   ```

2. **推送到GitHub**
   - 在GitHub创建新仓库（私有或公开均可）
   - 按GitHub提示推送代码：
   ```bash
   git remote add origin https://github.com/你的用户名/仓库名.git
   git branch -M main
   git push -u origin main
   ```

3. **导入到Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账号登录
   - 点击 "Add New..." → "Project"
   - 找到你的仓库，点击 "Import"

4. **配置环境变量**
   - 在 "Environment Variables" 部分，添加：
     - **Name**: `SUPABASE_URL`
     - **Value**: 粘贴第一步复制的 Project URL
     
     - **Name**: `SUPABASE_ANON_KEY`
     - **Value**: 粘贴第一步复制的 anon public key
   
   - 点击 "Add" 保存每个变量

5. **部署**
   - Framework Preset 选择 "Vite"（或保持自动检测）
   - 点击 "Deploy"
   - 等待2-3分钟部署完成

6. **访问网站**
   - 部署完成后，Vercel会提供一个域名，如：
     - `https://你的项目名.vercel.app`
   - 点击即可访问网站

### 第三步：首次使用

1. **注册管理员账号**
   - 打开网站，点击 "没有账号？去注册"
   - 填写：
     - 姓名：你的名字
     - 学号：你的学号
     - 邀请码：留空（首位用户自动成为管理员）
   - 点击 "注册"

2. **邀请同学注册**
   - 将网站链接分享给同学
   - 同学注册时需要填写邀请码：`药学2602`

3. **开始使用**
   - 管理员可以发布公告、添加活动
   - 所有成员可以分享学习资料、查看同学录

## 常见问题

### Q: 部署后访问显示404？
A: 检查 `vercel.json` 是否正确配置，确保路由规则生效。

### Q: 数据库连接失败？
A: 检查环境变量 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 是否正确设置。

### Q: 如何修改网站内容？
A: 修改代码后推送到GitHub，Vercel会自动重新部署。

### Q: 如何添加自定义域名？
A: 在Vercel项目设置中，点击 "Domains" → "Add"，输入你的域名。

### Q: 数据库密码忘记了？
A: 在Supabase项目设置 → "Database" 中可以重置密码。

## 技术栈

- **前端**: React + TypeScript + Vite + Tailwind CSS
- **后端**: Vercel Serverless Functions
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel

## 项目结构

```
├── api/                    # Vercel后端函数
│   └── app/
│       └── [[...path]].ts  # API路由处理
├── src/                    # React前端源码
│   ├── components/         # UI组件
│   ├── pages/             # 页面组件
│   ├── App.tsx            # 主应用
│   └── api.ts             # API调用
├── dist/                   # 构建输出
├── vercel.json            # Vercel配置
├── database-schema.sql    # 数据库架构
└── package.json
```

## 功能说明

1. **登录/注册系统**
   - 首位用户自动成为管理员
   - 其他用户需要邀请码：`药学2602`

2. **班级首页**
   - 班级简介
   - 快速导航
   - 班级口号

3. **班级公告**（管理员功能）
   - 发布通知
   - 查看所有公告

4. **活动相册**（管理员功能）
   - 添加活动记录
   - 上传照片链接
   - 查看活动历史

5. **学习资料**（所有成员）
   - 分享学习资源
   - 下载资料

6. **同学录**
   - 查看所有班级成员
   - 查看联系信息

## 后续维护

- **更新代码**：修改后推送到GitHub，自动部署
- **备份数据**：定期在Supabase导出数据库
- **监控使用**：在Vercel和Supabase控制台查看使用情况

## 支持

如有问题，请检查：
1. Vercel部署日志
2. Supabase数据库连接
3. 浏览器控制台错误信息

---

**部署预计时间**: 10-15分钟  
**成本**: 免费（Vercel和Supabase免费额度足够班级使用）
