<template>
  <div class="comfyui-gallery h-screen w-screen">
    <div class="top-div">
      <div class="back-div" @click="emits('close-gallery')">
        <i class="pi pi-chevron-left"></i>
      </div>
      <div class="title-div">工作流图库</div>
    </div>
    <div class="gallery-div">
      <div
        v-for="(imageItem, index) in galleryImageList"
        :key="index"
        class="gallery-image"
      >
        <div>
          <div class="image-container">
            <Image :src="imageItem.url" preview>
              <template #previewicon>
                <i></i>
              </template>
            </Image>
            <div class="hover-item icon-item delete-icon">
              <i class="pi pi-trash" style="font-size: 20px"></i>
            </div>
            <div class="hover-item icon-item collect-icon">
              <i class="pi pi-star" style="font-size: 20px"></i>
            </div>
            <!-- <div class="hover-item icon-item">
              <i class="pi pi-star-fill" style="font-size: 20px;"></i>
            </div> -->
            <div class="hover-item icon-item download-icon">
              <i-lucide:arrow-down-to-line style="width: 20px; height: 20px" />
            </div>
            <div class="hover-item btn-item">打开工作流</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Image from 'primevue/image'
import { ref } from 'vue'

const emits = defineEmits(['close-gallery'])

interface ImageItem {
  url: string
}

const galleryImageList = ref<ImageItem[]>([])
for (let i = 0; i < 40; i++) {
  galleryImageList.value.push({
    url: 'https://img0.baidu.com/it/u=2191392668,814349101&fm=253&app=138&f=JPEG?w=800&h=1399'
  })
}
</script>
<style>
.comfyui-gallery {
  top: 0;
  left: 0;
  position: absolute;
  z-index: 2000;
  background: #1f1f1f;
  .top-div {
    gap: 24px;
    flex: 1 0 0;
    height: 64px;
    display: flex;
    cursor: pointer;
    padding: 0px 24px;
    align-items: center;
    background: #101216;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    .back-div {
      display: flex;
      width: 40px;
      height: 40px;
      justify-content: center;
      align-items: center;
      border-radius: 2px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.12);
    }
    .title-div {
      color: #fff;
      font-family: 'Microsoft YaHei UI';
      font-size: 16px;
      font-weight: 400;
      height: 20px;
    }
  }
  .gallery-div {
    gap: 16px;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
    height: calc(100% - 64px);
    padding: 32px 100px 24px 100px;
    .gallery-image {
      width: calc(calc(100% - 80px) / 6);
      & > div {
        padding-top: 100%;
        position: relative;
        .image-container {
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          position: absolute;
          .p-image {
            width: 100%;
            height: 100%;
            &.p-image-preview {
              &:hover > .p-image-preview-mask {
                opacity: 0;
              }
            }
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
          &:hover {
            .hover-item {
              display: flex;
            }
          }
          .hover-item {
            display: none;
            position: absolute;
            align-items: center;
            cursor: pointer;
            color: rgba(34, 39, 34, 0.8);
            justify-content: center;
            &.icon-item {
              top: 12px;
              padding: 4px;
              align-items: center;
              gap: 12px;
              width: 32px;
              height: 32px;
              border-radius: 4px;
              background: rgba(255, 255, 255, 0.9);
              box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.12);
              &.delete-icon {
                left: 12px;
              }
              &.collect-icon {
                right: 52px;
              }
              &.download-icon {
                right: 12px;
              }
            }
            &.btn-item {
              bottom: 12px;
              left: 50%;
              width: 160px;
              height: 32px;
              border-radius: 2px;
              background: #43ff32;
              transform: translateX(-50%);
              color: #222722;
              font-family: 'Microsoft YaHei UI';
              font-size: 14px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
            }
          }
        }
      }
    }
  }
}
</style>
