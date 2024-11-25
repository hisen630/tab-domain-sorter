# Tab Domain Sorter (标签页域名排序器)

一个简单实用的 Chrome 扩展，帮助用户自动整理浏览器标签页，将相同域名的标签页组织在一起。

## 功能特点

- 一键按域名对标签页进行排序和分组
- 智能识别域名层级（一级域名 > 二级域名 > 三级域名）
- 相同域名下的标签页按 favicon 排序，保持视觉一致性
- 自动将三个或以上相同域名的标签页组成群组
- 自动识别现有的域名群组，新标签页会自动加入对应群组
- 保持非域名群组的完整性，仅对其内部标签页进行排序
- 所有群组自动折叠，保持界面整洁
- 不会关闭或重新加载标签页，只调整位置和分组

## 排序规则

1. 域名优先级：
   - 一级域名排在二级域名前面
   - 相同层级的域名按字母顺序排序
   - 最多保留三级域名

2. Favicon 排序：
   - 相同域名的标签页按 favicon URL 排序
   - 确保视觉上的连贯性

3. 群组处理：
   - 识别现有的域名命名群组
   - 三个以上相同域名的标签页自动创建新群组
   - 新标签页自动加入已有的域名群组
   - 保持非域名群组的完整性

## 安装方法

1. 下载或克隆本项目到本地
2. 打开 Chrome 浏览器，进入扩展程序页面 (chrome://extensions/)
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"，选择本项目文件夹
5. 安装完成后，扩展图标会出现在浏览器工具栏中

## 使用方法

1. 点击浏览器工具栏中的扩展图标
2. 扩展会自动：
   - 识别并保留现有群组
   - 对未分组的标签页进行分组
   - 将相同域名的标签页组织在一起
   - 对所有群组内的标签页进行排序
   - 折叠所有群组

## 项目结构