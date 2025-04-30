import type { ComfyWorkflowJSON } from '@/schemas/comfyWorkflowSchema'

/**
 * 默认工作流配置
 * 包含基本的文生图工作流节点
 */
export const defaultGraph: ComfyWorkflowJSON = {
  last_node_id: 9,
  last_link_id: 9,
  nodes: [
    // CLIP文本编码器 - 负面提示词
    {
      id: 7,
      type: 'CLIPTextEncode',
      pos: [413, 389],
      size: [425.28, 180.61],
      flags: {},
      order: 3,
      mode: 0,
      inputs: [
        { name: 'clip', type: 'CLIP', link: 5 }
      ],
      outputs: [
        {
          name: 'CONDITIONING',
          type: 'CONDITIONING',
          links: [6],
          slot_index: 0
        }
      ],
      properties: {},
      widgets_values: ['text, watermark']
    },
    // CLIP文本编码器 - 正面提示词
    {
      id: 6,
      type: 'CLIPTextEncode',
      pos: [415, 186],
      size: [422.85, 164.31],
      flags: {},
      order: 2,
      mode: 0,
      inputs: [
        { name: 'clip', type: 'CLIP', link: 3 }
      ],
      outputs: [
        {
          name: 'CONDITIONING',
          type: 'CONDITIONING',
          links: [4],
          slot_index: 0
        }
      ],
      properties: {},
      widgets_values: ['beautiful scenery nature glass bottle landscape, , purple galaxy bottle,']
    },
    // 空潜空间图像生成器
    {
      id: 5,
      type: 'EmptyLatentImage',
      pos: [473, 609],
      size: [315, 106],
      flags: {},
      order: 1,
      mode: 0,
      outputs: [
        { name: 'LATENT', type: 'LATENT', links: [2], slot_index: 0 }
      ],
      properties: {},
      widgets_values: [512, 512, 1]
    },
    // K采样器
    {
      id: 3,
      type: 'KSampler',
      pos: [863, 186],
      size: [315, 262],
      flags: {},
      order: 4,
      mode: 0,
      inputs: [
        { name: 'model', type: 'MODEL', link: 1 },
        { name: 'positive', type: 'CONDITIONING', link: 4 },
        { name: 'negative', type: 'CONDITIONING', link: 6 },
        { name: 'latent_image', type: 'LATENT', link: 2 }
      ],
      outputs: [
        { name: 'LATENT', type: 'LATENT', links: [7], slot_index: 0 }
      ],
      properties: {},
      widgets_values: [156680208700286, true, 20, 8, 'euler', 'normal', 1]
    },
    // VAE解码器
    {
      id: 8,
      type: 'VAEDecode',
      pos: [1209, 188],
      size: [210, 46],
      flags: {},
      order: 5,
      mode: 0,
      inputs: [
        { name: 'samples', type: 'LATENT', link: 7 },
        { name: 'vae', type: 'VAE', link: 8 }
      ],
      outputs: [
        { name: 'IMAGE', type: 'IMAGE', links: [9], slot_index: 0 }
      ],
      properties: {}
    },
    // 图像保存节点
    {
      id: 9,
      type: 'SaveImage',
      pos: [1451, 189],
      size: [210, 26],
      flags: {},
      order: 6,
      mode: 0,
      inputs: [
        { name: 'images', type: 'IMAGE', link: 9 }
      ],
      properties: {}
    },
    // 检查点加载器
    {
      id: 4,
      type: 'CheckpointLoaderSimple',
      pos: [26, 474],
      size: [315, 98],
      flags: {},
      order: 0,
      mode: 0,
      outputs: [
        { name: 'MODEL', type: 'MODEL', links: [1], slot_index: 0 },
        { name: 'CLIP', type: 'CLIP', links: [3, 5], slot_index: 1 },
        { name: 'VAE', type: 'VAE', links: [8], slot_index: 2 }
      ],
      properties: {},
      widgets_values: ['AWPainting_v1.4.safetensors']
    }
  ],
  // 节点之间的连接关系
  links: [
    [1, 4, 0, 3, 0, 'MODEL'],
    [2, 5, 0, 3, 3, 'LATENT'],
    [3, 4, 1, 6, 0, 'CLIP'],
    [4, 6, 0, 3, 1, 'CONDITIONING'],
    [5, 4, 1, 7, 0, 'CLIP'],
    [6, 7, 0, 3, 2, 'CONDITIONING'],
    [7, 3, 0, 8, 0, 'LATENT'],
    [8, 4, 2, 8, 1, 'VAE'],
    [9, 8, 0, 9, 0, 'IMAGE']
  ],
  groups: [],
  config: {},
  extra: {},
  version: 0.4
}

// 将默认工作流转换为JSON字符串
export const defaultGraphJSON = JSON.stringify(defaultGraph)

/**
 * 空白工作流配置
 * 用于初始化新的工作流
 */
export const blankGraph: ComfyWorkflowJSON = {
  last_node_id: 0,
  last_link_id: 0,
  nodes: [],
  links: [],
  groups: [],
  config: {},
  extra: {},
  version: 0.4
}

/**
 * 根据类型获取工作流配置
 * @param type 工作流类型
 * @returns 对应的工作流配置
 */
export function getGraphByType(type: number): ComfyWorkflowJSON {
  switch (type) {
    // 基础文生图工作流
    case 0:
      return {
        revision: 0,
        last_node_id: 137,
        last_link_id: 234,
        nodes: [
          // K采样器节点
          {
            id: 119,
            type: 'KSampler',
            pos: [960, 610],
            size: [280, 262],
            flags: {},
            order: 5,
            mode: 0,
            inputs: [
              {
                label: '模型',
                localized_name: '模型',
                name: 'model',
                type: 'MODEL',
                link: 232
              },
              {
                label: '正面条件',
                localized_name: '正面条件',
                name: 'positive',
                type: 'CONDITIONING',
                link: 226
              },
              {
                label: '负面条件',
                localized_name: '负面条件',
                name: 'negative',
                type: 'CONDITIONING',
                link: 227
              },
              {
                label: 'Latent',
                localized_name: 'Latent图像',
                name: 'latent_image',
                type: 'LATENT',
                link: 171
              },
              {
                localized_name: '种子',
                name: 'seed',
                type: 'INT',
                widget: { name: 'seed' },
                link: null
              },
              {
                localized_name: '步数',
                name: 'steps',
                type: 'INT',
                widget: { name: 'steps' },
                link: null
              },
              {
                localized_name: 'cfg',
                name: 'cfg',
                type: 'FLOAT',
                widget: { name: 'cfg' },
                link: null
              },
              {
                localized_name: '采样器名称',
                name: 'sampler_name',
                type: 'COMBO',
                widget: { name: 'sampler_name' },
                link: null
              },
              {
                localized_name: '调度器',
                name: 'scheduler',
                type: 'COMBO',
                widget: { name: 'scheduler' },
                link: null
              },
              {
                localized_name: '降噪',
                name: 'denoise',
                type: 'FLOAT',
                widget: { name: 'denoise' },
                link: null
              }
            ],
            outputs: [
              {
                label: 'Latent',
                localized_name: 'Latent',
                name: 'LATENT',
                type: 'LATENT',
                slot_index: 0,
                links: [170]
              }
            ],
            properties: {
              'Node name for S&R': 'KSampler',
              widget_ue_connectable: {}
            },
            widgets_values: [1057098545470946, 'randomize', 20, 8, 'dpmpp_2m', 'karras', 1]
          },
          // 空潜空间图像生成器
          {
            id: 92,
            type: 'EmptyLatentImage',
            pos: [710, 610],
            size: [210, 110],
            flags: {},
            order: 0,
            mode: 0,
            inputs: [
              {
                localized_name: '宽度',
                name: 'width',
                type: 'INT',
                widget: { name: 'width' },
                link: null
              },
              {
                localized_name: '高度',
                name: 'height',
                type: 'INT',
                widget: { name: 'height' },
                link: null
              },
              {
                localized_name: '批量大小',
                name: 'batch_size',
                type: 'INT',
                widget: { name: 'batch_size' },
                link: null
              }
            ],
            outputs: [
              {
                label: 'Latent',
                localized_name: 'Latent',
                name: 'LATENT',
                type: 'LATENT',
                slot_index: 0,
                links: [171]
              }
            ],
            properties: {
              'Node name for S&R': 'EmptyLatentImage',
              widget_ue_connectable: {}
            },
            widgets_values: [512, 768, 1]
          },
          // VAE解码器
          {
            id: 86,
            type: 'VAEDecode',
            pos: [1300, 610],
            size: [210, 46],
            flags: {},
            order: 6,
            mode: 0,
            inputs: [
              {
                label: 'Latent',
                localized_name: 'Latent',
                name: 'samples',
                type: 'LATENT',
                link: 170
              },
              {
                label: 'VAE',
                localized_name: 'vae',
                name: 'vae',
                type: 'VAE',
                link: 228
              }
            ],
            outputs: [
              {
                label: '图像',
                localized_name: '图像',
                name: 'IMAGE',
                type: 'IMAGE',
                slot_index: 0,
                links: [161]
              }
            ],
            properties: {
              'Node name for S&R': 'VAEDecode',
              widget_ue_connectable: {}
            },
            widgets_values: []
          },
          // 图像预览节点
          {
            id: 109,
            type: 'PreviewImage',
            pos: [1550, 610],
            size: [620, 690],
            flags: {},
            order: 7,
            mode: 0,
            inputs: [
              {
                label: '图像',
                localized_name: '图像',
                name: 'images',
                type: 'IMAGE',
                link: 161
              }
            ],
            outputs: [],
            properties: {
              'Node name for S&R': 'PreviewImage',
              widget_ue_connectable: {}
            },
            widgets_values: []
          },
          // 检查点加载器
          {
            id: 120,
            type: 'CheckpointLoaderSimple',
            pos: [50, 590],
            size: [315, 98],
            flags: {},
            order: 1,
            mode: 0,
            inputs: [
              {
                localized_name: 'Checkpoint名称',
                name: 'ckpt_name',
                type: 'COMBO',
                widget: { name: 'ckpt_name' },
                link: null
              }
            ],
            outputs: [
              {
                label: '模型',
                localized_name: '模型',
                name: 'MODEL',
                type: 'MODEL',
                slot_index: 0,
                links: [230]
              },
              {
                label: 'CLIP',
                localized_name: 'CLIP',
                name: 'CLIP',
                type: 'CLIP',
                slot_index: 1,
                links: [231]
              },
              {
                label: 'VAE',
                localized_name: 'VAE',
                name: 'VAE',
                type: 'VAE',
                slot_index: 2,
                links: [228]
              }
            ],
            properties: {
              'Node name for S&R': 'CheckpointLoaderSimple',
              widget_ue_connectable: {}
            },
            widgets_values: ['realisticVisionV60B1_v51VAE.safetensors']
          },
          // LoRA加载器
          {
            id: 137,
            type: 'LoraLoader',
            pos: [50, 760],
            size: [315, 126],
            flags: {},
            order: 2,
            mode: 0,
            inputs: [
              {
                localized_name: '模型',
                name: 'model',
                type: 'MODEL',
                link: 230
              },
              {
                localized_name: 'CLIPCLIP',
                name: 'clip',
                type: 'CLIP',
                link: 231
              },
              {
                localized_name: 'LoRA名称',
                name: 'lora_name',
                type: 'COMBO',
                widget: { name: 'lora_name' },
                link: null
              },
              {
                localized_name: '模型强度',
                name: 'strength_model',
                type: 'FLOAT',
                widget: { name: 'strength_model' },
                link: null
              },
              {
                localized_name: 'CLIP强度',
                name: 'strength_clip',
                type: 'FLOAT',
                widget: { name: 'strength_clip' },
                link: null
              }
            ],
            outputs: [
              {
                localized_name: '模型',
                name: 'MODEL',
                type: 'MODEL',
                links: [232]
              },
              {
                localized_name: 'CLIP',
                name: 'CLIP',
                type: 'CLIP',
                links: [233, 234]
              }
            ],
            properties: {
              'Node name for S&R': 'LoraLoader',
              widget_ue_connectable: {
                lora_name: true,
                strength_model: true,
                strength_clip: true
              }
            },
            widgets_values: ['3C产品渲染.safetensors', 1, 1]
          },
          // CLIP文本编码器 - 负面提示词
          {
            id: 85,
            type: 'CLIPTextEncode',
            pos: [400, 730],
            size: [250, 88],
            flags: {},
            order: 3,
            mode: 0,
            inputs: [
              {
                label: 'CLIP',
                localized_name: 'clip',
                name: 'clip',
                type: 'CLIP',
                link: 233
              },
              {
                localized_name: '文本',
                name: 'text',
                type: 'STRING',
                widget: { name: 'text' },
                link: null
              }
            ],
            outputs: [
              {
                label: '条件',
                localized_name: '条件',
                name: 'CONDITIONING',
                type: 'CONDITIONING',
                slot_index: 0,
                links: [227]
              }
            ],
            properties: {
              'Node name for S&R': 'CLIPTextEncode',
              widget_ue_connectable: {}
            },
            widgets_values: [''],
            color: '#322',
            bgcolor: '#533'
          },
          // CLIP文本编码器 - 正面提示词
          {
            id: 84,
            type: 'CLIPTextEncode',
            pos: [400, 600],
            size: [260, 88],
            flags: {},
            order: 4,
            mode: 0,
            inputs: [
              {
                label: 'CLIP',
                localized_name: 'clip',
                name: 'clip',
                type: 'CLIP',
                link: 234
              },
              {
                label: '文本',
                localized_name: '文本',
                name: 'text',
                type: 'STRING',
                widget: { name: 'text' },
                link: null
              }
            ],
            outputs: [
              {
                label: '条件',
                localized_name: '条件',
                name: 'CONDITIONING',
                type: 'CONDITIONING',
                slot_index: 0,
                links: [226]
              }
            ],
            properties: {
              'Node name for S&R': 'CLIPTextEncode',
              widget_ue_connectable: { text: true }
            },
            widgets_values: ['a apple'],
            color: '#232',
            bgcolor: '#353'
          }
        ],
        links: [
          [161, 86, 0, 109, 0, 'IMAGE'],
          [170, 119, 0, 86, 0, 'LATENT'],
          [171, 92, 0, 119, 3, 'LATENT'],
          [226, 84, 0, 119, 1, 'CONDITIONING'],
          [227, 85, 0, 119, 2, 'CONDITIONING'],
          [228, 120, 2, 86, 1, 'VAE'],
          [230, 120, 0, 137, 0, 'MODEL'],
          [231, 120, 1, 137, 1, 'CLIP'],
          [232, 137, 0, 119, 0, 'MODEL'],
          [233, 137, 1, 85, 0, 'CLIP'],
          [234, 137, 1, 84, 0, 'CLIP']
        ],
        groups: [],
        config: {},
        extra: {},
        version: 0.4
      }

    // Flux工作流
    case 1:
      return {
        revision: 0,
        last_node_id: 138,
        last_link_id: 234,
        nodes: [
          // UNet加载器
          {
            id: 26,
            type: 'UNETLoader',
            pos: [30.41, -540.25],
            size: [315, 82],
            flags: {},
            order: 0,
            mode: 0,
            inputs: [
              {
                localized_name: 'UNet名称',
                name: 'unet_name',
                type: 'COMBO',
                widget: { name: 'unet_name' },
                link: null
              },
              {
                localized_name: '数据类型',
                name: 'weight_dtype',
                type: 'COMBO',
                widget: { name: 'weight_dtype' },
                link: null
              }
            ],
            outputs: [
              {
                label: '模型',
                localized_name: '模型',
                name: 'MODEL',
                type: 'MODEL',
                slot_index: 0,
                links: [176, 223]
              }
            ],
            properties: {
              'Node name for S&R': 'UNETLoader',
              widget_ue_connectable: {}
            },
            widgets_values: ['flux1-dev-fp8.safetensors', 'fp8_e5m2']
          },
          // LoRA加载器
          {
            id: 137,
            type: 'LoraLoader',
            pos: [400, -710],
            size: [315, 126],
            flags: {},
            order: 8,
            mode: 0,
            inputs: [
              {
                localized_name: '模型',
                name: 'model',
                type: 'MODEL',
                link: 223
              },
              {
                localized_name: 'CLIPCLIP',
                name: 'clip',
                type: 'CLIP',
                link: 234
              },
              {
                localized_name: 'LoRA名称',
                name: 'lora_name',
                type: 'COMBO',
                widget: { name: 'lora_name' },
                link: null
              },
              {
                localized_name: '模型强度',
                name: 'strength_model',
                type: 'FLOAT',
                widget: { name: 'strength_model' },
                link: null
              },
              {
                localized_name: 'CLIP强度',
                name: 'strength_clip',
                type: 'FLOAT',
                widget: { name: 'strength_clip' },
                link: null
              }
            ],
            outputs: [
              {
                localized_name: '模型',
                name: 'MODEL',
                type: 'MODEL',
                links: [224]
              },
              {
                localized_name: 'CLIP',
                name: 'CLIP',
                type: 'CLIP',
                links: [225]
              }
            ],
            properties: {
              'Node name for S&R': 'LoraLoader',
              widget_ue_connectable: {
                lora_name: true,
                strength_model: true,
                strength_clip: true
              }
            },
            widgets_values: ['3C产品渲染.safetensors', 1, 1]
          },
          // Flux引导节点
          {
            id: 27,
            type: 'FluxGuidance',
            pos: [410, -530],
            size: [290, 60],
            flags: {},
            order: 10,
            mode: 0,
            inputs: [
              {
                label: '条件',
                localized_name: '条件',
                name: 'conditioning',
                type: 'CONDITIONING',
                link: 222
              },
              {
                localized_name: '引导',
                name: 'guidance',
                type: 'FLOAT',
                widget: { name: 'guidance' },
                link: null
              }
            ],
            outputs: [
              {
                label: '条件',
                localized_name: '条件',
                name: 'CONDITIONING',
                type: 'CONDITIONING',
                slot_index: 0,
                links: [93]
              }
            ],
            properties: {
              'Node name for S&R': 'FluxGuidance',
              widget_ue_connectable: {}
            },
            widgets_values: [3.5]
          },
          // 随机噪波生成器
          {
            id: 19,
            type: 'RandomNoise',
            pos: [790, -550],
            size: [315, 82],
            flags: {},
            order: 1,
            mode: 0,
            inputs: [
              {
                localized_name: '噪波随机种',
                name: 'noise_seed',
                type: 'INT',
                widget: { name: 'noise_seed' },
                link: null
              }
            ],
            outputs: [
              {
                label: '噪波生成',
                localized_name: '噪波',
                name: 'NOISE',
                type: 'NOISE',
                slot_index: 0,
                links: [13]
              }
            ],
            properties: {
              'Node name for S&R': 'RandomNoise',
              widget_ue_connectable: {}
            },
            widgets_values: [372249243692367, 'randomize']
          },
          // 基础引导器
          {
            id: 20,
            type: 'BasicGuider',
            pos: [790, -420],
            size: [300, 50],
            flags: {},
            order: 11,
            mode: 0,
            inputs: [
              {
                label: '模型',
                localized_name: '模型',
                name: 'model',
                type: 'MODEL',
                link: 224
              },
              {
                label: '条件',
                localized_name: '条件',
                name: 'conditioning',
                type: 'CONDITIONING',
                link: 93
              }
            ],
            outputs: [
              {
                label: '引导',
                localized_name: '引导器',
                name: 'GUIDER',
                type: 'GUIDER',
                links: [14]
              }
            ],
            properties: {
              'Node name for S&R': 'BasicGuider',
              widget_ue_connectable: {}
            },
            widgets_values: []
          },
          // K采样器选择器
          {
            id: 21,
            type: 'KSamplerSelect',
            pos: [780, -310],
            size: [315, 58],
            flags: {},
            order: 2,
            mode: 0,
            inputs: [
              {
                localized_name: '采样器名称',
                name: 'sampler_name',
                type: 'COMBO',
                widget: { name: 'sampler_name' },
                link: null
              }
            ],
            outputs: [
              {
                label: '采样器',
                localized_name: '采样器',
                name: 'SAMPLER',
                type: 'SAMPLER',
                links: [15]
              }
            ],
            properties: {
              'Node name for S&R': 'KSamplerSelect',
              widget_ue_connectable: {}
            },
            widgets_values: ['euler']
          },
          // 基础调度器
          {
            id: 22,
            type: 'BasicScheduler',
            pos: [780, -200],
            size: [315, 106],
            flags: {},
            order: 6,
            mode: 0,
            inputs: [
              {
                label: '模型',
                localized_name: '模型',
                name: 'model',
                type: 'MODEL',
                link: 176
              },
              {
                localized_name: '调度器',
                name: 'scheduler',
                type: 'COMBO',
                widget: { name: 'scheduler' },
                link: null
              },
              {
                localized_name: '步数',
                name: 'steps',
                type: 'INT',
                widget: { name: 'steps' },
                link: null
              },
              {
                localized_name: '降噪',
                name: 'denoise',
                type: 'FLOAT',
                widget: { name: 'denoise' },
                link: null
              }
            ],
            outputs: [
              {
                label: 'Sigmas',
                localized_name: 'Sigmas',
                name: 'SIGMAS',
                type: 'SIGMAS',
                links: [16]
              }
            ],
            properties: {
              'Node name for S&R': 'BasicScheduler',
              widget_ue_connectable: {}
            },
            widgets_values: ['simple', 25, 1]
          },
          // 自定义高级采样器
          {
            id: 15,
            type: 'SamplerCustomAdvanced',
            pos: [1150, -540],
            size: [272.36, 124.54],
            flags: {},
            order: 12,
            mode: 0,
            inputs: [
              {
                label: '噪波生成',
                localized_name: '噪波',
                name: 'noise',
                type: 'NOISE',
                link: 13
              },
              {
                label: '引导',
                localized_name: '引导器',
                name: 'guider',
                type: 'GUIDER',
                link: 14
              },
              {
                label: '采样器',
                localized_name: '采样器',
                name: 'sampler',
                type: 'SAMPLER',
                link: 15
              },
              {
                label: 'Sigmas',
                localized_name: '西格玛',
                name: 'sigmas',
                type: 'SIGMAS',
                link: 16
              },
              {
                label: 'Latent',
                localized_name: 'Latent图像',
                name: 'latent_image',
                type: 'LATENT',
                link: 20
              }
            ],
            outputs: [
              {
                label: '输出',
                localized_name: 'Latent',
                name: 'output',
                type: 'LATENT',
                slot_index: 0,
                links: [85]
              },
              {
                label: '降噪输出',
                localized_name: '降噪Latent',
                name: 'denoised_output',
                type: 'LATENT',
                slot_index: 1,
                links: []
              }
            ],
            properties: {
              'Node name for S&R': 'SamplerCustomAdvanced',
              widget_ue_connectable: {}
            },
            widgets_values: [],
            color: '#323',
            bgcolor: '#535'
          },
          // 空潜空间图像生成器
          {
            id: 24,
            type: 'EmptyLatentImage',
            pos: [780, -40],
            size: [310, 110],
            flags: {},
            order: 3,
            mode: 0,
            inputs: [
              {
                localized_name: '宽度',
                name: 'width',
                type: 'INT',
                widget: { name: 'width' },
                link: null
              },
              {
                localized_name: '高度',
                name: 'height',
                type: 'INT',
                widget: { name: 'height' },
                link: null
              },
              {
                localized_name: '批量大小',
                name: 'batch_size',
                type: 'INT',
                widget: { name: 'batch_size' },
                link: null
              }
            ],
            outputs: [
              {
                label: 'Latent',
                localized_name: 'Latent',
                name: 'LATENT',
                type: 'LATENT',
                slot_index: 0,
                links: [20]
              }
            ],
            properties: {
              'Node name for S&R': 'EmptyLatentImage',
              widget_ue_connectable: {}
            },
            widgets_values: [1024, 1024, 1]
          },
          // VAE解码器
          {
            id: 8,
            type: 'VAEDecode',
            pos: [1160, -230],
            size: [210, 46],
            flags: {},
            order: 13,
            mode: 0,
            inputs: [
              {
                label: 'Latent',
                localized_name: 'Latent',
                name: 'samples',
                type: 'LATENT',
                link: 85
              },
              {
                label: 'VAE',
                localized_name: 'vae',
                name: 'vae',
                type: 'VAE',
                link: 226
              }
            ],
            outputs: [
              {
                label: '图像',
                localized_name: '图像',
                name: 'IMAGE',
                type: 'IMAGE',
                slot_index: 0,
                links: [56]
              }
            ],
            properties: {
              'Node name for S&R': 'VAEDecode',
              widget_ue_connectable: {}
            },
            widgets_values: []
          },
          // 图像预览节点
          {
            id: 49,
            type: 'PreviewImage',
            pos: [1550, -580],
            size: [710, 660],
            flags: {},
            order: 14,
            mode: 0,
            inputs: [
              {
                label: '图像',
                localized_name: '图像',
                name: 'images',
                type: 'IMAGE',
                link: 56
              }
            ],
            outputs: [],
            properties: {
              'Node name for S&R': 'PreviewImage',
              widget_ue_connectable: {}
            },
            widgets_values: []
          },
          // CLIP文本编码器 - 负面提示词
          {
            id: 7,
            type: 'CLIPTextEncode',
            pos: [410, -230],
            size: [300, 88],
            flags: {},
            order: 7,
            mode: 0,
            inputs: [
              {
                label: 'CLIP',
                localized_name: 'clip',
                name: 'clip',
                type: 'CLIP',
                link: 58
              },
              {
                localized_name: '文本',
                name: 'text',
                type: 'STRING',
                widget: { name: 'text' },
                link: null
              }
            ],
            outputs: [
              {
                label: '条件',
                localized_name: '条件',
                name: 'CONDITIONING',
                type: 'CONDITIONING',
                slot_index: 0,
                links: []
              }
            ],
            properties: {
              'Node name for S&R': 'CLIPTextEncode',
              widget_ue_connectable: {}
            },
            widgets_values: [''],
            color: '#322',
            bgcolor: '#533'
          },
          // CLIP文本编码器 - 正面提示词
          {
            id: 6,
            type: 'CLIPTextEncode',
            pos: [420, -420],
            size: [280, 120],
            flags: {},
            order: 9,
            mode: 0,
            inputs: [
              {
                label: 'CLIP',
                localized_name: 'clip',
                name: 'clip',
                type: 'CLIP',
                link: 225
              },
              {
                label: '文本',
                localized_name: '文本',
                name: 'text',
                type: 'STRING',
                widget: { name: 'text' },
                link: null
              }
            ],
            outputs: [
              {
                label: '条件',
                localized_name: '条件',
                name: 'CONDITIONING',
                type: 'CONDITIONING',
                slot_index: 0,
                links: [222]
              }
            ],
            properties: {
              'Node name for S&R': 'CLIPTextEncode',
              widget_ue_connectable: { text: true }
            },
            widgets_values: ['a apple\n'],
            color: '#232',
            bgcolor: '#353'
          },
          // 双CLIP加载器
          {
            id: 50,
            type: 'DualCLIPLoader',
            pos: [30, -410],
            size: [320, 130],
            flags: {},
            order: 4,
            mode: 0,
            inputs: [
              {
                localized_name: 'CLIP名称1',
                name: 'clip_name1',
                type: 'COMBO',
                widget: { name: 'clip_name1' },
                link: null
              },
              {
                localized_name: 'CLIP名称2',
                name: 'clip_name2',
                type: 'COMBO',
                widget: { name: 'clip_name2' },
                link: null
              },
              {
                localized_name: '类型',
                name: 'type',
                type: 'COMBO',
                widget: { name: 'type' },
                link: null
              },
              {
                localized_name: '设备',
                name: 'device',
                shape: 7,
                type: 'COMBO',
                widget: { name: 'device' },
                link: null
              }
            ],
            outputs: [
              {
                label: 'CLIP',
                localized_name: 'CLIP',
                name: 'CLIP',
                type: 'CLIP',
                slot_index: 0,
                links: [58, 234]
              }
            ],
            properties: {
              'Node name for S&R': 'DualCLIPLoader',
              widget_ue_connectable: {}
            },
            widgets_values: ['t5xxl_fp8_e4m3fn.safetensors', 'clip_l.safetensors', 'flux', 'default']
          },
          // VAE加载器
          {
            id: 46,
            type: 'VAELoader',
            pos: [110, -220],
            size: [240, 70],
            flags: {},
            order: 5,
            mode: 0,
            inputs: [
              {
                localized_name: 'vae名称',
                name: 'vae_name',
                type: 'COMBO',
                widget: { name: 'vae_name' },
                link: null
              }
            ],
            outputs: [
              {
                label: 'VAE',
                localized_name: 'VAE',
                name: 'VAE',
                type: 'VAE',
                slot_index: 0,
                links: [226]
              }
            ],
            properties: {
              'Node name for S&R': 'VAELoader',
              widget_ue_connectable: {}
            },
            widgets_values: ['ae.safetensors'],
            color: '#223',
            bgcolor: '#335'
          }
        ],
        links: [
          [13, 19, 0, 15, 0, 'NOISE'],
          [14, 20, 0, 15, 1, 'GUIDER'],
          [15, 21, 0, 15, 2, 'SAMPLER'],
          [16, 22, 0, 15, 3, 'SIGMAS'],
          [20, 24, 0, 15, 4, 'LATENT'],
          [56, 8, 0, 49, 0, 'IMAGE'],
          [58, 50, 0, 7, 0, 'CLIP'],
          [85, 15, 0, 8, 0, 'LATENT'],
          [93, 27, 0, 20, 1, 'CONDITIONING'],
          [176, 26, 0, 22, 0, 'MODEL'],
          [222, 6, 0, 27, 0, 'CONDITIONING'],
          [223, 26, 0, 137, 0, 'MODEL'],
          [224, 137, 0, 20, 0, 'MODEL'],
          [225, 137, 1, 6, 0, 'CLIP'],
          [226, 46, 0, 8, 1, 'VAE'],
          [234, 50, 0, 137, 1, 'CLIP']
        ],
        groups: [],
        config: {},
        extra: {},
        version: 0.4
      }

    // 默认返回空白工作流
    default:
      return blankGraph
  }
}
