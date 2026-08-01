---
类型: 教程
来源: Knowledge-Notes
tags: [嵌入式软硬件开发知识库, 教程]
创建: 2026-07-23
状态: 种子
---

# 22-Linux基础与开发工具实战

## 这条教程在解决什么
- 为嵌入式开发者整理 Linux 必备的基础知识和开发工具链。从装机到日常开发工作流的标准化操作手册。
- 覆盖：Shell、vim、gcc、git、Docker、SSH、环境变量、man手册、curl、thrift、虚拟机部署、计算机网络基础、操作系统基础。

## 关键步骤（我照着做的）

### 1. 开发环境搭建
**虚拟机安装 Ubuntu**：
- VMware/VirtualBox 新建虚拟机 → 分配 4GB+ 内存、20GB+ 磁盘
- 安装 Ubuntu 后第一件事：换阿里源（`/etc/apt/sources.list` 替换 `archive.ubuntu.com` 为 `mirrors.aliyun.com`）
- `sudo apt update && sudo apt upgrade`

**SSH 远程连接**：
```bash
# Ubuntu 安装 SSH Server
sudo apt install openssh-server
# 从宿主机连接
ssh username@192.168.x.x
```
参考 [[嵌入式Linux]]

### 2. Linux 常用命令与知识点
参考 [[Linux文件IO与系统调用]]：
- **文件操作**：`ls -la`（权限详情）、`cp -r`（递归复制）、`mv`（移动/重命名）、`find . -name "*.c"`（搜索文件）
- **文本处理**：`grep "error" log.txt`、`cat file | wc -l`（行数统计）、`head -n 10`、`tail -f`（实时查看）
- **系统信息**：`uname -a`（内核版本）、`df -h`（磁盘）、`free -m`（内存）、`ps aux`（进程）、`top`（实时监控）
- **权限管理**：`chmod 755 file`（读写执行）、`chown user:group file`
- **管道与重定向**：`cmd1 | cmd2`（管道串联）、`cmd > file`（输出重定向）、`cmd 2>&1`（合并标准输出和错误输出）

**环境变量**：
```bash
echo $PATH        # 查看当前 PATH
export VAR=value  # 临时设置
# 永久设置：写入 ~/.bashrc，然后 source ~/.bashrc
```
参考 [[编译工具链]]

### 3. 开发工具链
**vim 编辑器**：
- 三模式：普通模式（`hjkl` 移动 / `dd` 删行 / `yy` 复制 / `p` 粘贴）、插入模式（`i/a/o`）、命令模式（`:wq` 保存退出 / `:set nu` 行号）
- `.vimrc` 配置：`set tabstop=4 shiftwidth=4 expandtab`（用空格替代 Tab）
- 学习建议：用 `vimtutor` 命令练习 30 分钟，之后在日常中强制使用

**gcc 编译器**：
参考 [[编译工具链]]：
```bash
gcc -c file.c -o file.o          # 只编译不链接
gcc file.o -o program             # 链接
gcc -g -O0 -Wall program.c -o program  # 调试版本（-g 加符号、-O0 不优化、-Wall 全警告）
gcc -O2 -s program.c -o program   # 发布版本（-O2 优化、-s strip 去符号）
```

**git 版本控制**：
```bash
git init / git clone [url]     # 初始化/克隆
git add file.c                 # 暂存
git commit -m "description"    # 提交
git push / git pull            # 推送/拉取
git branch feature_x           # 创建分支
git checkout main / git merge feature_x  # 切换/合并
```
`.gitignore` 文件：排除编译产物 `*.o`、`*.out`、`build/` 目录

**Docker 容器**：
- 概念：比虚拟机更轻量的应用打包工具。Dockerfile 描述环境 → `docker build` 创建镜像 → `docker run` 启动容器
- 在嵌入式交叉编译中：用 Docker 创建统一编译环境（固定 gcc 版本、依赖库），避免"在我机器上能编译"问题
- 常用命令：`docker ps`（运行中的容器）、`docker images`（本地镜像）、`docker exec -it [容器] bash`（进入容器）

**man 手册**：
```bash
man 2 open     # 第 2 节：系统调用
man 3 printf   # 第 3 节：库函数
man 7 socket   # 第 7 节：协议/概念
```

### 4. 网络工具与协议
**curl**：命令行 HTTP 客户端
```bash
curl -X POST -H "Content-Type: application/json" -d '{"key":"val"}' http://api.example.com
curl -O http://example.com/file.tar.gz  # 下载文件
```

**HTTP/HTTPS 协议**：参考 [[通信协议设计]] 和 [[TCP三次握手与四次挥手]]
- HTTP：请求行 + 头部 + 空行 + 消息体。方法：GET/POST/PUT/DELETE。状态码：200 OK / 404 Not Found / 500 Server Error
- HTTPS = HTTP + TLS 加密，端口 443，需要 CA 证书验证

**网络抓包**：`tcpdump` 命令行抓包 / `Wireshark` 图形化分析
```bash
tcpdump -i eth0 port 80 -w capture.pcap  # 抓取 80 端口的包
```

**thrift**：跨语言 RPC 框架（Facebook 开源），用 IDL 定义接口 → 自动生成 C++/Python/Java 客户端和服务端代码

### 5. Linux 编码风格
参考 [[C语言编码规范]]：
- Linux 内核编码规范：缩进用 8 字符的 Tab，函数名和变量名用下划线（`send_data`，不是 SendData 或 sendData）
- 与 Windows/单片机命名习惯完全不同（后者通常用骆驼命名法）
- 参考文件：内核源码树 `Documentation/CodingStyle`

### 6. 操作系统基础
- **进程管理**：`fork()/exec()` 创建进程，参考 [[进程与线程(Linux)]]
- **虚拟内存**：每个进程有独立的地址空间（0-4GB，32位），通过页表映射到物理内存
- **文件系统**：VFS（虚拟文件系统）抽象层，让 Linux 统一操作 ext4/FAT/NTFS/NFS
- **中断上下文 vs 进程上下文**：中断上下文不能睡眠、不能调用可能阻塞的函数

## 我卡住/没懂的地方
- Docker 的镜像/容器/卷的概念一开始很绕。记住：镜像是只读模板（类似 ISO），容器是运行实例（类似虚拟机），卷是持久化存储（绕过容器生命周期）。
- gcc `-I`（头文件路径）和 `-L`（库路径）和 `-l`（链接库名）三个参数的区别和顺序很重要，搞错就会 "undefined reference"。
- Shell 脚本中单引号和双引号的区别：单引号内所有字符都是字面量（`'$PATH'` 输出 `$PATH`），双引号会展开变量。

## 它背后的原理（别只记操作）
- `export PATH=$PATH:/new/dir` 中的 `$PATH` 引用旧值并在后面追加新路径，这是环境变量拼接的标准写法。Linux Shell 在收到命令时，会按 PATH 中的路径顺序搜索可执行文件。
- git 的暂存区（stage/index）是理解 git 工作流的关键：工作区 → `git add` → 暂存区 → `git commit` → 本地仓库 → `git push` → 远程仓库。
- Linux "一切皆文件" 的设计哲学：设备（`/dev/`）、进程信息（`/proc/`）、网络 Socket 都用文件描述符操作。`read/write/close` 对文件、管道、Socket 都适用。[[Linux文件IO与系统调用]]

## 我能复用/改编的点
> Docker 固定编译环境 + git 版本管理的组合是团队协作的标准配置，任何一个嵌入式 Linux 项目都应该这样搭建。
> Shell 脚本自动化：把重复的编译、部署、测试命令写成脚本，`#!/bin/bash` 开头。

## 关联
- 概念：[[嵌入式Linux]] [[Linux文件IO与系统调用]] [[编译工具链]] [[C语言编码规范]] [[进程与线程(Linux)]] [[TCP三次握手与四次挥手]] [[通信协议设计]]
- 教程：[[20-树莓派系统搭建与内核编译]] [[23-Linux驱动与系统编程]]

## 来源
- Knowledge-Notes: Linux常用指令、Linux知识点整理、Linux基础知识、Linux小工具、Shell语法、vim、gcc、git、Docker、SSH、环境变量、man手册、curl、thrift、虚拟机安装、HTTP&HTTPS、Tor洋葱头、网络抓包、操作系统知识、编码风格
