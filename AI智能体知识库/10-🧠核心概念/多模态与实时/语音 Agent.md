---
类型: 概念
主题: 多模态与实时
tags:
  - AI智能体知识库
  - 多模态与实时
创建: 2026-07-30
复习:
状态: 已完成
task:
  id: task-msab6ric4qaakf
---

# 语音 Agent

## 一句话定义
> 语音 Agent 是用声音当输入输出界面的 Agent：你说的话经 ASR 转文字→LLM 思考→TTS 念回来，闭环跑在几百毫秒延迟预算里，还要能"被打断"（全双工）。它不是"文本 Agent 后面挂个 TTS"那么简单。

## 它解决什么问题 / 为什么存在
- 语音 Agent ≠ 文本循环 + TTS。延迟预算极严（约 600ms），部分音频是常态，话轮判断（turn detection）本身是个模型，传输从电话 SIP 到 WebRTC 都有。
- 要么自建"基于帧（frame）的流水线"（Pipecat），要么依托平台（LiveKit）。否则会出现：用户打断时 Agent 还在啰嗦、低置信度转写被当真理、TTS 念到一半被掐断等故障。

## 核心原理（大二能懂的水平）
- **经典闭环**：`VAD（检测有人说话）→ STT（语音识别 ASR）→ LLM（上下文交替 user/assistant）→ TTS（文本转语音）→ transport（传输）`。
- **Pipecat 的帧流水线**：Frame 是流水线里的类型化数据单元（audio / transcript / text / tts_audio / control）。`FrameProcessor` 链用 `process(frame)` 处理。两个方向：
  - **DOWNSTREAM**：source→sink（音频进、语音出）
  - **UPSTREAM**：反馈与控制（取消、指标、barge-in 打断）
  - `PipelineTask` 用事件管生命周期（on_pipeline_started / on_idle_timeout），观察者做指标/追踪。
- **LiveKit Agents**：用 WebRTC 把模型桥接到用户。两类语音 Agent：
  - `MultimodalAgent`：音频直接进、音频直接出（如 OpenAI Realtime），中间没有文本。
  - `VoicePipelineAgent`：STT→LLM→TTS 级联，给文本级控制。
  - 语义话轮检测用 transformer 模型；原生 MCP 集成；SIP 接电话。
- **商业平台**：Vapi（优化栈 ~450–600ms）、Retell（~600ms 端到端）基于上述构建；不想养 WebRTC 团队就选它们。

## 关键参数 / 易错点
- **延迟预算**（2026 典型）：VAD 20–60ms、STT 部分结果 100–250ms、LLM 首 token 150–400ms、TTS 首音频 100–200ms、传输 RTT 30–80ms。端到端 450–600ms 是高端，800–1200ms 常见，>1500ms 就感觉坏了。发货前把链路各段加起来再决定。
- **无打断处理（barge-in）**：用户插话 Agent 还在说。需要 Pipecat 的 UPSTREAM cancel 帧 / LiveKit 等价物。
- **忽略 STT 置信度**：低置信转写当真理喂给 LLM。→ 按置信度门控或请求确认。
- **TTS 句中截断**：流水线中途取消时，TTS 要知道或切断音频。
- **全双工 vs 半双工**：实时方案（Realtime / Gemini Live）走音频直进直出，天然支持打断；级联方案要单独处理 barge-in。

## 类比（帮助理解）
- 像电话客服中心：VAD 是"听筒摘机检测"，STT 是"速记员"，LLM 是"坐席大脑"，TTS 是"念稿员"，barge-in 是"客户打断时坐席闭嘴"。
- 像流水线工厂：每个工位（VAD/STT/LLM/TTS）处理一种 Frame，上下游各管各的。

## 设计时怎么用（反推思维）
> 做语音助手/客服时，我会先反推"延迟和打断是硬指标"：要全控制→用 Pipecat 自建帧流水线并显式处理 barge-in；要 WebRTC/电话→用 LiveKit；无 WebRTC 团队→Vapi/Retell。并把"STT 置信度门控 + TTS 可中断 + 全链路延迟预算"列为架构第一约束，而不是事后补。

## 典型应用 / 我在哪见过
- Pipecat（Python 帧流水线）、LiveKit Agents（WebRTC 优先）、Vapi / Retell（托管语音）。
- OpenAI Realtime / Gemini Live 走音频直进直出（MultimodalAgent 类）。

## 关联
- 前置知识：[[语音交互]]、[[语音识别 ASR]]、[[文本转语音 TTS]]
- 相关：[[多模态]]、[[实时交互]]、[[流式输出]]
- 反例/误区：以为"文本 Agent 加个 TTS 就是语音 Agent"——缺打断/话轮检测/延迟预算会翻车。

## 来源
- AIEFS Vol.5 Agents, Ch.75 Voice Agents: Pipecat and LiveKit
- 相关：Ch.22 Audio-Language Models、Ch.23 Omni Models（Whisper→Audio Flamingo 3、Qwen2.5-Omni Thinker-Talker 分裂）
