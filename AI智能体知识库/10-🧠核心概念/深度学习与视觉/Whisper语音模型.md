---
类型: 概念
主题: 深度学习与视觉
tags:
  - AI智能体知识库
  - 深度学习与视觉
创建: 2026-07-30
复习:
状态: 已完成
task:
  id: task-msab6o5bjlqsda
decision-suggestions:
  - "28 篇笔记标签相似但未互链: 建议补充 [[10-🧠核心概念/深度学习与视觉/音频基础.md]] → [[10-🧠核心概念/深度学习与视觉/迁移学习.md]] (相似度: 100%)"
decision-generated: 2026-08-01T13:21:25.149Z
---

# Whisper语音模型

## 一句话定义
> Whisper 是 OpenAI 发布的 30 秒窗口 Transformer 编码器-解码器，在 68 万小时多语言弱监督音频-文本对上训练，一个架构支持 99 种语言的转录、翻译和时间戳——2026 年的 ASR 参考标准。

## 它解决什么问题 / 为什么存在
- 提供一个"粘贴音频即得文本"的商品级 ASR：99 种语言、抗噪、可在笔记本运行。
- 用特殊 token 提示实现一个模型多任务：语言识别、转录、翻译、时间戳——不需要为每个任务训练不同模型。
- 但 Whisper 不是黑盒：领域偏移（专业术语、口音、专有名词）会导致性能下降，需要理解其架构和微调方法。

## 核心原理（大二能懂的水平）
- **架构**：标准 Transformer 编码器-解码器。输入是 30 秒 log-Mel 频谱图（80 mel × 3000 帧），编码器用卷积下采样 + N 层 Transformer block，解码器用因果自注意力 + 交叉注意力连接编码器输出。Large-v3 有 32 层、1280 维、1.55B 参数。
- **提示格式**：通过 decoder 中的特殊 token 控制任务：`<|startoftranscript|><|en|><|transcribe|><|notimestamps|>`。改 `<|en|>` 为 `<|fr|>` 就转录法语，改 `<|transcribe|>` 为 `<|translate|>` 就翻译成英语。
- **30 秒窗口**：所有处理以 30 秒为单位。短音频零填充，长音频需要分块（如 WhisperX 用 30 秒块 + 5 秒重叠 + VAD 静音门控防幻觉）。
- **预处理必须用 Whisper 自带的**：`whisper.audio.log_mel_spectrogram`，不能用 librosa 的 mel——因为 Whisper 用自己训练语料的均值/标准差做归一化。
- **微调**：LoRA 只训练注意力层的 q_proj/v_proj（r=16 时 Turbo 仅 0.65M 可训练参数），4 倍省显存且 WER 代价 <0.3%。数据 <10 小时冻结编码器只调解码器。

## 关键参数 / 易错点
- 默认参数应覆盖：`temperature=0.0`（避免随机采样）、`condition_on_previous_text=False`（防止级联幻觉）、`no_speech_threshold=0.6`（静音检测）。
- Turbo 变体用 4 层解码器（从 32 层减少），延迟降 8 倍，WER 仅升 <1%——是 2026 年生产首选。
- 长音频处理：用 WhisperX（Silero VAD + 词级对齐 + 说话人分离），不要用原生 `model.transcribe` 处理 1 小时文件。
- 微调时不要换 tokenizer——Whisper 的 BPE 词表（51,865 token）与模型训练强绑定。

## 类比（帮助理解）
- Whisper 像一个精通 99 国语言的同声传译员，但你每次只能给她 30 秒的音频。她用特殊的"任务卡片"（提示 token）知道你要转录还是翻译、输出哪种语言。如果给她错误采样率的音频，就像给她戴了变形的耳机——她还是会"翻译"出东西，但内容完全不对。

## 设计时怎么用（反推思维）
> 做 ASR 系统时，默认用 Whisper Large-v3-turbo + WhisperX 处理长音频。通用英语场景直接用预训练模型；专业领域（医疗、法律）收集 10-100 小时标注数据用 LoRA 微调解码器。移动端用 Whisper-Tiny int8 量化或 Moonshine。

## 典型应用 / 我在哪见过
- 播客/视频自动字幕生成
- 语音助手的前端 ASR（配合 [[语音交互]] 和 [[实时交互]]）
- 多语言会议实时翻译
- 微调案例：20 小时医疗听写将 WER 从 12% 降到 4.5%

## 关联
- 前置知识：[[Transformer]] [[音频基础]]
- 相关：[[语音识别 ASR]] [[LoRA Low-Rank Adaptation]] [[流式输出]] [[神经音频编解码器]]
- 反例/误区：用 librosa 代替 Whisper 自带的 mel 频谱图预处理（归一化统计量不同导致性能下降）

## 来源
- AIEFS Vol.2 Deep Learning, Ch.51 "Whisper — Architecture & Fine-Tuning"
