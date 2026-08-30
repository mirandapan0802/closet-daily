# 衣橱日签 MVP

个人/家庭自用的手机网页 PWA 原型，用来管理衣服、根据天气推荐日常穿搭，并减少重复购买。

## vivo / Android 使用方式

1. 把项目部署到一个 HTTPS 地址，例如 GitHub Pages。
2. 用 vivo 浏览器或 Chrome 打开网址。
3. 在浏览器菜单里选择“添加到桌面”或“安装应用”。
4. 首次点击“关联当天真实天气”时允许定位。

本地 `http://127.0.0.1:8765/` 适合电脑预览；手机端要使用定位、离线缓存和接近 App 的安装体验，建议放到 HTTPS。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个空仓库，例如 `closet-daily`。
2. 在本地绑定远端：
   ```bash
   git remote add origin git@github.com:<你的用户名>/closet-daily.git
   ```
3. 提交并推送：
   ```bash
   git add .
   git commit -m "Build wardrobe PWA prototype"
   git push -u origin main
   ```
4. 进入 GitHub 仓库的 `Settings -> Pages`。
5. `Build and deployment` 选择 `Deploy from a branch`。
6. `Branch` 选择 `main`，目录选择 `/root`，保存。
7. 等 GitHub Pages 部署完成后，访问：
   ```text
   https://<你的用户名>.github.io/closet-daily/
   ```

## 天气方案

当前原型使用 Open-Meteo Forecast API：

- 无需 API Key。
- 前端用手机定位拿经纬度。
- 请求当前温度、天气码、今日最高/最低温和降水概率。
- 推荐逻辑根据温度和降水概率调整穿搭说明。

## 推送方案

安卓 PWA 可以支持 Web Push，但真实“每天早上自动推送”需要：

- HTTPS 部署
- service worker
- 后端定时任务
- 用户授权通知权限

当前原型先保留提醒入口，并说明真实推送所需条件。
