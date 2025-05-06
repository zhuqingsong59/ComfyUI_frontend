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
        last_node_id: 138,
        last_link_id: 235,
        nodes: [
          // 检查点加载器
          {
            id: 120,
            type: 'CheckpointLoaderSimple',
            pos: [9.599185943603516, 487.2520446777344],
            size: [315, 98],
            flags: {},
            order: 0,
            mode: 0,
            inputs: [],
            outputs: [
              {
                label: '模型',
                name: 'MODEL',
                type: 'MODEL',
                slot_index: 0,
                links: [230]
              },
              {
                label: 'CLIP',
                name: 'CLIP',
                type: 'CLIP',
                slot_index: 1,
                links: [231]
              },
              {
                label: 'VAE',
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
          // Lora加载器
          {
            id: 137,
            type: 'LoraLoader',
            pos: [-17.101499557495117, 704.4173583984375],
            size: [315, 126],
            flags: {},
            order: 2,
            mode: 0,
            inputs: [
              {
                name: 'model',
                type: 'MODEL',
                link: 230
              },
              {
                name: 'clip',
                type: 'CLIP',
                link: 231
              }
            ],
            outputs: [
              {
                name: 'MODEL',
                type: 'MODEL',
                links: [232]
              },
              {
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
            widgets_values: ['3C产品渲染.safetensors', 0.8, 0.8]
          },
          // 负面提示词编码器
          {
            id: 85,
            type: 'CLIPTextEncode',
            pos: [35.815528869628906, 928.072998046875],
            size: [250, 88],
            flags: {},
            order: 3,
            mode: 0,
            inputs: [
              {
                label: 'CLIP',
                name: 'clip',
                type: 'CLIP',
                link: 233
              }
            ],
            outputs: [
              {
                label: '条件',
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
          // VAE解码器
          {
            id: 86,
            type: 'VAEDecode',
            pos: [865.2767333984375, 403.7296142578125],
            size: [210, 46],
            flags: {},
            order: 6,
            mode: 0,
            inputs: [
              {
                label: 'Latent',
                name: 'samples',
                type: 'LATENT',
                link: 170
              },
              {
                label: 'VAE',
                name: 'vae',
                type: 'VAE',
                link: 228
              }
            ],
            outputs: [
              {
                label: '图像',
                name: 'IMAGE',
                type: 'IMAGE',
                slot_index: 0,
                links: [235]
              }
            ],
            properties: {
              'Node name for S&R': 'VAEDecode',
              widget_ue_connectable: {}
            },
            widgets_values: []
          },
          // 空潜空间图像生成器
          {
            id: 92,
            type: 'EmptyLatentImage',
            pos: [675.0722045898438, 749.2128295898438],
            size: [210, 110],
            flags: {},
            order: 1,
            mode: 0,
            inputs: [],
            outputs: [
              {
                label: 'Latent',
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
            widgets_values: [512, 768, 4]
          },
          // K采样器
          {
            id: 119,
            type: 'KSampler',
            pos: [941.4839477539062, 581.80517578125],
            size: [280, 262],
            flags: {},
            order: 5,
            mode: 0,
            inputs: [
              {
                label: '模型',
                name: 'model',
                type: 'MODEL',
                link: 232
              },
              {
                label: '正面条件',
                name: 'positive',
                type: 'CONDITIONING',
                link: 226
              },
              {
                label: '负面条件',
                name: 'negative',
                type: 'CONDITIONING',
                link: 227
              },
              {
                label: 'Latent',
                name: 'latent_image',
                type: 'LATENT',
                link: 171
              }
            ],
            outputs: [
              {
                label: 'Latent',
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
            widgets_values: [2397308936578, 'randomize', 20, 8, 'dpmpp_2m', 'karras', 1]
          },
          // 图像保存节点
          {
            id: 138,
            type: 'SaveImage',
            pos: [1321.14794921875, 515.2029418945312],
            size: [315, 270],
            flags: {},
            order: 7,
            mode: 0,
            inputs: [
              {
                name: 'images',
                type: 'IMAGE',
                link: 235
              }
            ],
            outputs: [],
            properties: {
              'Node name for S&R': 'SaveImage'
            },
            widgets_values: ['ComfyUI']
          },
          // 正面提示词编码器
          {
            id: 84,
            type: 'CLIPTextEncode',
            pos: [363.7989501953125, 324.02777099609375],
            size: [282.7763671875, 312.7784423828125],
            flags: {},
            order: 4,
            mode: 0,
            inputs: [
              {
                label: 'CLIP',
                name: 'clip',
                type: 'CLIP',
                link: 234
              }
            ],
            outputs: [
              {
                label: '条件',
                name: 'CONDITIONING',
                type: 'CONDITIONING',
                slot_index: 0,
                links: [226]
              }
            ],
            properties: {
              'Node name for S&R': 'CLIPTextEncode',
              widget_ue_connectable: {
                text: true
              }
            },
            widgets_values: ['a apple'],
            color: '#232',
            bgcolor: '#353'
          }
        ],
        links: [
          [170, 119, 0, 86, 0, 'LATENT'],
          [171, 92, 0, 119, 3, 'LATENT'],
          [226, 84, 0, 119, 1, 'CONDITIONING'],
          [227, 85, 0, 119, 2, 'CONDITIONING'],
          [228, 120, 2, 86, 1, 'VAE'],
          [230, 120, 0, 137, 0, 'MODEL'],
          [231, 120, 1, 137, 1, 'CLIP'],
          [232, 137, 0, 119, 0, 'MODEL'],
          [233, 137, 1, 85, 0, 'CLIP'],
          [234, 137, 1, 84, 0, 'CLIP'],
          [235, 86, 0, 138, 0, 'IMAGE']
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
        last_node_id: 139,
        last_link_id: 235,
        nodes: [
          // Flux引导节点
          {
            id: 27,
            type: 'FluxGuidance',
            pos: [410, -530],
            size: [290, 60],
            flags: {},
            order: 9,
            mode: 0,
            inputs: [
              {
                label: '条件',
                name: 'conditioning',
                type: 'CONDITIONING',
                link: 222
              }
            ],
            outputs: [
              {
                label: '条件',
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
          // 双CLIP加载器
          {
            id: 50,
            type: 'DualCLIPLoader',
            pos: [30, -410],
            size: [320, 130],
            flags: {},
            order: 0,
            mode: 0,
            inputs: [],
            outputs: [
              {
                label: 'CLIP',
                name: 'CLIP',
                type: 'CLIP',
                slot_index: 0,
                links: [234]
              }
            ],
            properties: {
              'Node name for S&R': 'DualCLIPLoader',
              widget_ue_connectable: {}
            },
            widgets_values: [
              't5xxl_fp8_e4m3fn.safetensors',
              'clip_l.safetensors',
              'flux',
              'default'
            ]
          },
          // VAE加载器
          {
            id: 46,
            type: 'VAELoader',
            pos: [110, -220],
            size: [240, 70],
            flags: {},
            order: 1,
            mode: 0,
            inputs: [],
            outputs: [
              {
                label: 'VAE',
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
          },
          // Lora加载器
          {
            id: 137,
            type: 'LoraLoader',
            pos: [400, -710],
            size: [315, 126],
            flags: {},
            order: 7,
            mode: 0,
            inputs: [
              {
                name: 'model',
                type: 'MODEL',
                link: 223
              },
              {
                name: 'clip',
                type: 'CLIP',
                link: 234
              }
            ],
            outputs: [
              {
                name: 'MODEL',
                type: 'MODEL',
                links: [224]
              },
              {
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
            widgets_values: ['3C产品渲染.safetensors', 0.8, 0.8]
          },
          // UNET加载器
          {
            id: 26,
            type: 'UNETLoader',
            pos: [36.0938720703125, -564.213623046875],
            size: [315, 82],
            flags: {},
            order: 2,
            mode: 0,
            inputs: [],
            outputs: [
              {
                label: '模型',
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
          // 随机噪波生成器
          {
            id: 19,
            type: 'RandomNoise',
            pos: [775.2999267578125, -713.6644287109375],
            size: [315, 82],
            flags: {},
            order: 3,
            mode: 0,
            inputs: [],
            outputs: [
              {
                label: '噪波生成',
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
            pos: [774.222412109375, -584.7655639648438],
            size: [300, 50],
            flags: {},
            order: 10,
            mode: 0,
            inputs: [
              {
                label: '模型',
                name: 'model',
                type: 'MODEL',
                link: 224
              },
              {
                label: '条件',
                name: 'conditioning',
                type: 'CONDITIONING',
                link: 93
              }
            ],
            outputs: [
              {
                label: '引导',
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
            pos: [768.042236328125, -477.5953369140625],
            size: [315, 58],
            flags: {},
            order: 4,
            mode: 0,
            inputs: [],
            outputs: [
              {
                label: '采样器',
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
            pos: [759.2813110351562, -362.7928771972656],
            size: [315, 106],
            flags: {},
            order: 6,
            mode: 0,
            inputs: [
              {
                label: '模型',
                name: 'model',
                type: 'MODEL',
                link: 176
              }
            ],
            outputs: [
              {
                label: 'Sigmas',
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
            pos: [1159.2822265625, -713.1251220703125],
            size: [272.3617858886719, 124.53733825683594],
            flags: {},
            order: 11,
            mode: 0,
            inputs: [
              {
                label: '噪波生成',
                name: 'noise',
                type: 'NOISE',
                link: 13
              },
              {
                label: '引导',
                name: 'guider',
                type: 'GUIDER',
                link: 14
              },
              {
                label: '采样器',
                name: 'sampler',
                type: 'SAMPLER',
                link: 15
              },
              {
                label: 'Sigmas',
                name: 'sigmas',
                type: 'SIGMAS',
                link: 16
              },
              {
                label: 'Latent',
                name: 'latent_image',
                type: 'LATENT',
                link: 20
              }
            ],
            outputs: [
              {
                label: '输出',
                name: 'output',
                type: 'LATENT',
                slot_index: 0,
                links: [85]
              },
              {
                label: '降噪输出',
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
          // VAE解码器
          {
            id: 8,
            type: 'VAEDecode',
            pos: [1216.613525390625, -527.6597900390625],
            size: [210, 46],
            flags: {},
            order: 12,
            mode: 0,
            inputs: [
              {
                label: 'Latent',
                name: 'samples',
                type: 'LATENT',
                link: 85
              },
              {
                label: 'VAE',
                name: 'vae',
                type: 'VAE',
                link: 226
              }
            ],
            outputs: [
              {
                label: '图像',
                name: 'IMAGE',
                type: 'IMAGE',
                slot_index: 0,
                links: [235]
              }
            ],
            properties: {
              'Node name for S&R': 'VAEDecode',
              widget_ue_connectable: {}
            },
            widgets_values: []
          },
          // 提示词编码器
          {
            id: 6,
            type: 'CLIPTextEncode',
            pos: [402.0821838378906, -412.0190734863281],
            size: [308.4735107421875, 330.7297668457031],
            flags: {},
            order: 8,
            mode: 0,
            inputs: [
              {
                label: 'CLIP',
                name: 'clip',
                type: 'CLIP',
                link: 225
              }
            ],
            outputs: [
              {
                label: '条件',
                name: 'CONDITIONING',
                type: 'CONDITIONING',
                slot_index: 0,
                links: [222]
              }
            ],
            properties: {
              'Node name for S&R': 'CLIPTextEncode',
              widget_ue_connectable: {
                text: true
              }
            },
            widgets_values: ['a apple\n'],
            color: '#232',
            bgcolor: '#353'
          },
          // 图像保存节点
          {
            id: 139,
            type: 'SaveImage',
            pos: [1488.5325927734375, -528.0352783203125],
            size: [315, 58],
            flags: {},
            order: 13,
            mode: 0,
            inputs: [
              {
                name: 'images',
                type: 'IMAGE',
                link: 235
              }
            ],
            outputs: [],
            properties: {
              'Node name for S&R': 'SaveImage'
            },
            widgets_values: ['ComfyUI']
          },
          // 空潜空间图像生成器
          {
            id: 24,
            type: 'EmptyLatentImage',
            pos: [760.5887451171875, -205.1580352783203],
            size: [310, 110],
            flags: {},
            order: 5,
            mode: 0,
            inputs: [],
            outputs: [
              {
                label: 'Latent',
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
            widgets_values: [1024, 1024, 4]
          }
        ],
        links: [
          [13, 19, 0, 15, 0, 'NOISE'],
          [14, 20, 0, 15, 1, 'GUIDER'],
          [15, 21, 0, 15, 2, 'SAMPLER'],
          [16, 22, 0, 15, 3, 'SIGMAS'],
          [20, 24, 0, 15, 4, 'LATENT'],
          [85, 15, 0, 8, 0, 'LATENT'],
          [93, 27, 0, 20, 1, 'CONDITIONING'],
          [176, 26, 0, 22, 0, 'MODEL'],
          [222, 6, 0, 27, 0, 'CONDITIONING'],
          [223, 26, 0, 137, 0, 'MODEL'],
          [224, 137, 0, 20, 0, 'MODEL'],
          [225, 137, 1, 6, 0, 'CLIP'],
          [226, 46, 0, 8, 1, 'VAE'],
          [234, 50, 0, 137, 1, 'CLIP'],
          [235, 8, 0, 139, 0, 'IMAGE']
        ],
        groups: [],
        config: {},
        extra: {
          ds: {
            scale: 0.9090909090909091,
            offset: [196.55845092422467, 1059.3259535660327]
          },
          frontendVersion: '1.17.5',
          workspace_info: {
            id: 'S89MC58karuibYAFjjDB1'
          },
          ue_links: [],
          links_added_by_ue: []
        },
        version: 0.4
      }

    // 默认返回空白工作流
    default:
      return blankGraph
  }
}
