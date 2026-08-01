---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# Voice Agent

## 一句话定义
> Voice Agent（语音 Agent）是端到端"听-想-说"的对话 Agent：音频进来经 ASR 转写，LLM 流式生成，TTS 流式念出，全程低延迟并支持打断（barge-in）与中途工具调用。

## 它解决什么问题 / 为什么存在
- 文字聊天有门槛；语音是自然的人机交互。但要"像人一样顺"需端到端延迟 < 800ms、不抢话、被打断能停、调工具不卡顿。
- 2025-2026 是语音 UX 发展最快的赛道，OpenAI Realtime API、Gemini Live、LiveKit、Pipecat 都把首音频压到亚 800ms。

## 核心原理（大二电子信息工程专业学生能懂）
- **五段流式流水线**：
  音频入(WebRTC) → ASR(流式转写, Deepgram/Silero+Whisper) → 轮次检测(VAD+turn-detector) → LLM(流式) → TTS(流式) → 音频回传。
- **三大跨切关注点**：
  - Barge-in（打断）：用户中途开口，TTS 立即取消、ASR 重新接管。
  - 工具调用：对话中调函数（天气/日历）走旁路，超过 300ms 先吐"稍等"填充词。
  - 背压（backpressure）：丢包时暂缓说话、抬高语音门限，避免抢话。
- **量化指标**：首音频 p50<800ms、误截断率<3%、TTS MOS>4.2、WER<8%（15dB 信噪比）、单卡 50 并发。

## 关键参数 / 易错点
- 轮次检测易误判：VAD 静音阈值与完成分数要调，否则要么抢话要么反应慢。
- 工具慢会卡音频：必须旁路 + 填充词，不能阻塞主音频流。
- 网络抖动：要用 WebRTC 抖动缓冲与丢包模拟压测。

## 类比（帮助理解）
- 像接一个"实时同传+会办事"的电话客服：你说完它马上回，你插嘴它立刻停。

## 设计时怎么用（反推思维）
> 做语音助手时，我会用 ASR+VAD+turn-detector+流式 LLM+TTS 的管线，把工具调用放旁路并配填充词，并用 WER/MOS/误截断率验收，而不是三个 REST 调用拼起来。

## 典型应用 / 我在哪见过
- 电话客服、语音助手、kiosk；配合 [[Realtime API]] 做集成语音模型。

## 关联
- 前置知识：[[Agent]], [[大语言模型 LLM]], [[函数调用 Function Calling]]
- 相关：[[Realtime API]], [[Agent 追踪 Trace]], 多模态（如相关）
- 反例/误区：用三次独立 REST（识别→生成→合成）拼语音——延迟高、无法打断，体验差。

## 来源
- ai-engineering-from-scratch 仓库 `phases/19-capstone-projects/03-realtime-voice-assistant/docs/en.md`
- LiveKit / Pipecat / OpenAI Realtime 文档 / 通用认知
