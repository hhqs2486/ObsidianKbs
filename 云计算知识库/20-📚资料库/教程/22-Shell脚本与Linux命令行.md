---
类型: 教程
来源: Shell 集群 15 本合集
tags: [教程, Shell, Linux, 基础与工具]
创建: 2026-07-21
状态: 已读待消化
---

# Shell脚本与Linux命令行（15 本合并）

## 这条教程在解决什么
- 把 15 本 Shell / Linux 命令行书**合并消化**成一张"工程师武器清单"：Shell 是 Linux 自动化的入口，掌握「变量 / 引号 / 管道 / 重定向 / 条件循环 / 函数」六件套，再接上 [[sed]] [[awk]] [[正则表达式]] 做 [[文本处理]]，你就有了日常运维、排障、写 [[CI-CD]] 脚本的全部基础。
- 读者定位：大二学生，用「从需求反推」的工程师思维学——不是背命令，而是"我要做什么 → 该串哪些命令 → 为什么这么串"。

## 关键内容（按提纲）

### 一、Shell 基础（先会跑起来）
- **为什么是 bash**：服务器默认 shell 是 [[bash]]，它既是交互解释器也是脚本引擎。一切从 [[Linux命令行]] 来。
- **第一个脚本**：首行 `#!/bin/bash` 叫 shebang，告诉系统用 bash 跑我；写完 `chmod +x xxx.sh` 后 `./xxx.sh` 执行。
  ```bash
  #!/bin/bash
  echo "Hello World!"          # 来自《100个Linux+Shell脚本经典案例》案例1
  ```
- **两种执行方式的区别**（坑点）：
  - `./script.sh` 或 `bash script.sh` → 开**子 shell** 跑，脚本里改的环境变量不影响当前终端；
  - `source script.sh` 或 `. script.sh` → 在**当前 shell** 跑，能改动你的环境变量（常用于 `source ~/.bashrc`）。
- **退出状态 `$?`**：命令成功返回 `0`，失败返回非 `0`。这是 `if` 判断和管道后判断成败的依据。
- **三个保命开关**（写脚本必加在 shebang 后）：
  ```bash
  set -e   # 任意命令失败立刻退出，防错误雪崩
  set -u   # 用到未定义变量直接报错，防拼错变量名静默出错
  set -x   # 打印每条实际执行的命令，排障神器
  ```

### 二、变量与引号（最容易翻车的地方）
- **赋值等号两侧不能有空格**：`var=value` 对，`var = value` 错（会被当成"运行 var 命令"）。
- **三种引号**（核心易错点）：
  - 双引号 `"$var"`：**部分引用**，变量会被展开，但阻止单词拆分和通配符展开 → 大多数情况用它包变量；
  - 单引号 `'${var}'`：**全引用**，里面一切原样，变量不展开 → 要写正则、写 `$` 字面量时用；
  - 反引号 `` `cmd` `` 或更好用的 `$()`：**命令替换**，把命令的输出当成字符串用。
  ```bash
  DATE=$(date +%F_%H-%M-%S)        # 推荐 $()，可读性好
  echo "今天是 $DATE"              # 双引号里 $DATE 被展开
  echo '今天是 $DATE'              # 单引号里原样输出 $DATE
  ```
- **特殊变量**（脚本里天天用）：
  - `$0` 脚本名，`$1`/`$2`… 第 1/2 个参数，`$@` 全部参数，`$#` 参数个数；
  - `$?` 上条命令退出状态，`$$` 当前 shell PID，`$!` 上一个后台命令 PID。
  ```bash
  # 通过位置变量创建系统账户及密码（《100个案例》案例2）
  #!/bin/bash
  useradd "$1"
  echo "$2" | passwd --stdin "$1"
  ```
- **环境变量**用 `export` 导出，子进程才能继承；**数组** `arr=(a b c)`，`${arr[0]}` 取值——bash 独有，写 `#!/bin/sh` 不能用。

### 三、条件与循环（控制流）
- **测试命令三兄弟**：`test`、`[ ]`（等价 test）、`[[ ]]`（bash 增强，推荐）。注意 `[` 后面和 `]` 前面都要有空格。
  ```bash
  if [ -f "$file" ]; then echo "是文件"; fi      # -f 文件存在且为普通文件
  if [ -d "$dir" ]; then echo "是目录"; fi       # -d 目录
  if [ -z "$var" ]; then echo "变量为空"; fi     # -z 长度为0
  if [ "$USER" == "root" ]; then echo "我是root"; fi
  ```
- **比较类型要分清**（经典坑）：
  - 数值用 `-eq -ne -lt -le -gt -ge`（`[ 1 -eq 1 ]`），**别用 `==` 比数值**；
  - 字符串用 `==` / `!=`；
  - 逻辑与 `-a`、或 `-o`（在 `[ ]` 内），或干脆用 `&&` / `||`（在 `[[ ]]` 或命令间）。
- **`if / case / for / while`**：
  ```bash
  # if 多分支
  if [ $score -ge 60 ]; then echo "及格"
  elif [ $score -ge 0 ]; then echo "不及格"
  else echo "非法"; fi

  # case 多值匹配（比一堆 if 清爽）
  case "$1" in
    start) echo "启动" ;;
    stop)  echo "停止" ;;
    *)     echo "用法: $0 start|stop" ;;
  esac

  # for 遍历
  for DB in $DB_LIST; do
      mysqldump "$DB" > "${DB}_bak.sql"
  done

  # while 死循环 + 条件跳出（《100个案例》监控脚本）
  while : ; do
      if [ $disk_size -le 512000 -a $mem_size -le 1024000 ]; then
          mail -s "Warning" root <<EOF
  Insufficient resources, 资源不足
  EOF
      fi
      sleep 5
  done
  ```
- **算术**：`(( ))` 里可写类 C 表达式，`$(( ))` 做算术展开，`let i++`。
  ```bash
  i=0; while (( i < 10 )); do echo $i; ((i++)); done
  echo $(( 100 % 10 ))   # 取余，做随机数范围常用
  ```

### 四、函数（把重复逻辑封装）
- 定义：`function name() { ... }` 或 `name() { ... }`；调用直接 `name 参数`。
- **`local` 声明局部变量**避免污染全局；`return` 只返回 0–255 的"状态码"，想返回数据就用 `echo` + 命令替换。
  ```bash
  # 计算两个数字之和并返回（用 echo 传值）
  add() {
      local a=$1 b=$2
      echo $(( a + b ))
  }
  result=$(add 3 5)   # result = 8
  ```
- 函数本质是"一条新命令"，能出现在管道里、能被 `source` 后复用；复杂脚本把每步拆成函数，主逻辑只剩 `main` 调用，可读可测。

### 五、文本处理（接上 [[sed]] [[awk]] [[正则表达式]]）
> 这部分 15 本书和《sed 与 awk》重合度最高，按约定**不重建卡片**，直接链接已有概念：[[文本处理]] [[sed]] [[awk]] [[正则表达式]]。这里只讲"它们怎么嵌进 Shell 流水线"。
- **基础三板斧（纯 bash 也能用）**：`grep` 过滤行、`cut`/`sort`/`uniq` 切列去重、`head`/`tail` 取头尾、`tr` 换字符。
  ```bash
  # 统计访问最多的 IP（grep 过滤 + sort + uniq 计数 + sort 倒序取 Top）
  cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
  ```
- **[[sed]]**：流编辑器，按行做"查找→替换/删除"，经典 `s/旧/新/`：
  ```bash
  sed 's/old/new/g' file.txt          # 全局替换（g=每行所有匹配）
  sed -i 's/old/new/g' file.txt       # -i 直接改原文件
  ```
- **[[awk]]**：按列处理的结构化文本计算器，默认按空白分列，`$1` 第一列、`$NF` 最后一列：
  ```bash
  awk -F: '{print $1}' /etc/passwd    # -F: 指定冒号分隔，打印用户名
  awk '$3 > 100 {print $1, $3}' data  # 第三列>100 才输出
  ```
- **[[正则表达式]]**：`grep -E`、`sed`、`awk` 的匹配引擎，`.` `*` `[]` `^` `$` `()` `{}` 这套元字符是"文本处理的通用语法"。
- 记忆口诀：**grep 找行、sed 改行、awk 算列、正则定规则**——它们都通过 [[管道与重定向]] 串进流水线。

### 六、实战脚本（能直接抄的真实例子）
> 以下均来自合集中的 249 个脚本 / 100 个案例，已是最贴近生产的写法。
1. **Nginx 日志按天切割**（《249个脚本》案例5）
   ```bash
   #!/bin/bash
   LOG_DIR=/usr/local/nginx/logs
   YESTERDAY=$(date -d "yesterday" +%F)
   MONTH_DIR=$LOG_DIR/$(date +"%Y-%m")
   [ ! -d "$MONTH_DIR" ] && mkdir -p "$MONTH_DIR"
   mv $LOG_DIR/default.access.log $MONTH_DIR/default.access.log_$YESTERDAY
   kill -USR1 $(cat /var/run/nginx.pid)   # 让 nginx 重新打开日志文件
   ```
2. **MySQL 多库循环备份 + 静默错误**（《249个脚本》案例3/4）
   ```bash
   #!/bin/bash
   DATE=$(date +%F_%H-%M-%S); HOST=localhost; USER=backup; PASS=123.com
   BACKUP_DIR=/data/db_backup
   DB_LIST=$(mysql -h$HOST -u$USER -p$PASS -s -e "show databases;" 2>/dev/null \
             | egrep -v "Database|information_schema|mysql|performance_schema|sys")
   for DB in $DB_LIST; do
       mysqldump -h$HOST -u$USER -p$PASS -B $DB > $BACKUP_DIR/${DB}_${DATE}.sql 2>/dev/null \
           || echo "${DB} 备份失败!"
   done
   ```
3. **DDoS 自动封禁异常 IP**（《249个脚本》案例1）
   ```bash
   #!/bin/bash
   DATE=$(date +%d/%b/%Y:%H:%M)
   LOG=/usr/local/nginx/logs/demo2.access.log
   ABNORMAL_IP=$(tail -n5000 "$LOG" | grep "$DATE" \
       | awk '{a[$1]++} END{for(i in a) if(a[i]>10) print i}')
   for IP in $ABNORMAL_IP; do
       if [ $(iptables -vnL | grep -c "$IP") -eq 0 ]; then
           iptables -I INPUT -s "$IP" -j DROP
           echo "$(date +'%F_%T') $IP" >> /tmp/drop_ip.log
       fi
   done
   ```
4. **每周五定时打包日志（结合 crontab）**（《100个案例》案例3）
   ```bash
   #!/bin/bash
   tar -czf log-$(date +%Y%m%d).tar.gz /var/log
   # crontab -e 加一行： 00 03 * * 5 /root/logbak.sh
   ```
5. **猜数字小游戏**（练 `RANDOM` 与 `while`/`if`）
   ```bash
   #!/bin/bash
   target=$(( RANDOM % 100 + 1 ))   # RANDOM 是 0~32767 系统变量
   while : ; do
       read -p "猜 1~100: " n
       if   [ "$n" -eq "$target" ]; then echo "猜对了!"; break
       elif [ "$n" -lt "$target" ]; then echo "小了"
       else echo "大了"; fi
   done
   ```

## 我卡住/没懂的地方
- **重定向顺序 `>file 2>&1` vs `2>&1 >file`**：一开始总搞反。记住"从右往左、且 `2>&1` 复制的是 1 的*当前*去向"——所以必须先 `2>&1` 再 `>file`（见 [[管道与重定向]] 关键易错点）。
- **单引号 vs 双引号**：写正则、写含 `$` 的 ssh 远程命令时，用错引号导致变量在本地被提前展开。规则：要保留字面 `$` 就用单引号。
- **`[ ]` 与 `[[ ]]`**：数值比较用 `-eq` 还是 `==` 常常混；字符串带空格不加引号会"单词拆分"报错。结论：bash 脚本一律用 `[[ ]]` + 变量加双引号，少踩 80% 的坑。
- **后台任务退出终端被杀死**：只写 `&` 不够，必须 `nohup ... &` 或 `disown`（见 [[进程与作业控制]]）。

## 它背后的原理（别只记操作）
- Shell 不是"编程语言"，而是**命令调度器**：它 fork 子进程去跑外部命令，自己只负责解析、展开、串联。理解这点，就懂了为什么变量赋值不能有空格、为什么管道要新进程、`$?` 为什么是子进程的退出码。
- **一切皆文件 + 文件描述符**：stdin/stdout/stderr 不过是 fd 0/1/2，管道和重定向本质是"把这些 fd 重新接线"。这是 [[管道与重定向]] 和 [[Linux命令行]] 的共同底层。
- **Unix 哲学**：小程序只做一件事，用 [[管道与重定向]] 拼起来做大事。Shell 脚本的价值不在"语法多强"，而在"会挑命令、会串流水线"。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- **六件套模板**：任何"定时/批量/巡检"需求，套 `变量定义 → 参数校验 → 主逻辑函数 → 错误重定向 → 退出状态` 骨架即可。
- **日志切割套路**：换成任意会写文件的程序（Tomcat、Kafka），把 `kill -USR1` 换成对应重开日志的信号/命令即可复用。
- **Top-N 统计**：`grep|awk '{print $1}'|sort|uniq -c|sort -rn|head` 这套流水线可套到"找最耗 CPU 的进程""找最活跃的 API"等任意计数场景。
- **异常自动处置**：把"统计>阈值就 action"的模式，从封 IP 改成"重启服务 / 发告警 / 扩容"，直接变成 [[CI-CD]] 里的自愈脚本。

## 关联
- 概念（本批自建）：[[bash]] [[管道与重定向]] [[进程与作业控制]] [[Linux命令行]]
- 概念（其它 agent 已建，仅链接）：[[sed]] [[awk]] [[正则表达式]] [[文本处理]] [[Shell脚本]] [[CI-CD]]
- 项目：（本批不建项目实战，相关脚本思路可挂入运维/发布类项目）

## 来源（全部 15 本）
1. 《249个拿来即用Shell脚本》（shell-249）
2. 《Shell脚本编程入门笔记》（shell-rumen-note）
3. 《Shell编程基础》（shell-base）
4. 《shell编写规范》（shell-spec）
5. 《Shell从入门到精通》（shell-master）
6. 《Shell脚本基础》（shell-base2）
7. 《100个Linux+Shell脚本经典案例》（shell-100cases）
8. 《Linux Shell脚本攻略（中文扫描版）》（shell-strategy-cn）
9. 《Linux Shell脚本攻略（英文扫描版）》（shell-strategy）
10. 《Linux Shell脚本攻略（第3版）》（shell-strategy-2nd）
11. 《LinuxShell》（shell-linuxshell）
12. 《Shell脚本学习指南》（shell-study，即 Classic Shell Scripting）
13. 《Shell编程从入门到精通》（shell-pro-master）
14. 《玩透sed》（sed-principle）
15. 《精通正则表达式》（regex-master）
