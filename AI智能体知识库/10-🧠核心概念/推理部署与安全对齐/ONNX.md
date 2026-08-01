---
类型: 概念
主题: 推理部署与安全对齐
tags:
  - AI智能体知识库
  - 推理部署与安全对齐
创建: 2026-07-30
复习:
状态: 已完成
task:
  id: task-msab6qx8fluuo9
---

# ONNX

## 一句话定义
> ONNX（Open Neural Network Exchange，开放神经网络交换格式）是一种与框架、与硬件都无关的中间模型格式，让"在 PyTorch 里训的模型"能无障碍丢到任意推理引擎/芯片上去跑。

## 它解决什么问题 / 为什么存在
- 训练框架（PyTorch、TensorFlow、JAX）和部署目标（云端 GPU、手机 NPU、浏览器、嵌入式）各说各话。模型从"训好"到"能部署"常被格式绑死：换硬件或换引擎就要重写。
- ONNX 充当"通用字节码"：把计算图（算子 + 权重）标准化成一种图表示，再用各平台的 ONNX Runtime 执行，打通框架与硬件之间的壁垒。

## 核心原理（大二能懂的水平）
- **计算图中间表示**：模型被导出成一张有向图——节点是算子（Conv、MatMul、LayerNorm…），边是张量。PyTorch 的 `torch.onnx.export`、TensorFlow 的转换器都能产出这张图。
- **算子集（opset）版本化**：ONNX 的算子集合像"指令集版本"，导出时选定 opset；旧 Runtime 不支持新算子是常见坑，需对齐版本。
- **ONNX Runtime 是执行器**：它接过 ONNX 图，按目标硬件选最优内核——CPU、CUDA、TensorRT（NVIDIA）、Core ML（Apple）、QNN（Qualcomm）等后端都能挂。一次导出，多端运行。
- **与量化的关系**：ONNX 图可再做量化（把权重/激活从 FP32 压到 INT8），ONNX Runtime 提供量化工具链。这也是它和 [[模型量化 Quantization]] 衔接的入口——很多端侧 INT8 部署是从 ONNX 量化开始的。

## 关键参数 / 易错点
- **opset 版本对齐**：导出的 opset 必须 ≤ 目标 Runtime 支持的版本，否则加载失败。
- **动态轴（dynamic axes）**：变长输入（如变长序列、batch）要在导出时声明动态维度，否则被固化成固定形状，部署时一换尺寸就报错。
- **控制流/自定义算子**：含 Python 控制流或框架特有算子的模型导出易失真，往往需要改写或用自定义算子。
- **不是万能部署终极方案**：ONNX 偏"互通格式"，云端 LLM 生产更多是 vLLM/TRT-LLM 直接吃原生权重；ONNX 在跨框架、跨端侧、中小模型部署上价值最大。

## 类比（帮助理解）
- 像 USB 标准：设备（模型）不管厂牌，只要符合 USB 规范（ONNX 图），插到任意带驱动的口（ONNX Runtime 各后端）就能用。也像 JVM 字节码：一次编译（导出 ONNX），到处运行（多后端执行）。

## 设计时怎么用（反推思维）
> 要把一个在 PyTorch 训好的模型部署到"手机 + 云 + 浏览器"多端时，我会先用它能解决"框架/硬件锁定"——先把模型导成 ONNX（对齐 opset、声明动态轴），再在每端用对应 ONNX Runtime 后端跑；若端侧要省显存/提速，就从 ONNX 走 INT8 量化（接 [[模型量化 Quantization]]），必要时再进一步编译进 [[TensorRT]]（NVIDIA）或 Core ML（Apple）拿更优内核。

## 典型应用 / 我在哪见过
- 跨框架互通：PyTorch 模型转 ONNX 后在 Windows（DirectML）、云 CPU 上推理。
- 端侧部署链路：ONNX → 量化 → Core ML（Apple ANE）/ QNN（Qualcomm Hexagon）/ TensorRT（NVIDIA Jetson）。
- 中小模型（CV、分类、排序）的生产推理常驻 ONNX Runtime。

## 关联
- 前置知识：[[模型量化 Quantization]]（ONNX 是量化入口之一）
- 相关：[[TensorRT]]（ONNX 可进一步编译进 TensorRT 拿 NVIDIA 极致优化）、[[边缘推理]]（跨端部署靠 ONNX 打通）
- 反例/误区：导出时不声明动态轴导致部署换尺寸即崩；以为 ONNX 自带最优性能（它只是格式，性能靠后端+量化）。

## 来源
- AIEFS Vol.6 Production, Ch.15（边缘推理中提及 ONNX→QNN/Core ML 转换链路）；ONNX / ONNX Runtime 官方文档
