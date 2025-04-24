<template>
  <div class="comfyui-gallery h-screen w-screen">
    <div class="top-div">
      <div class="back-div">
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Image from 'primevue/image'
import { ref } from 'vue'

interface ImageItem {
  url: string
}

const galleryImageList = ref<ImageItem[]>([])
for (let i = 0; i < 40; i++) {
  galleryImageList.value.push({
    url: 'https://wx3.sinaimg.cn/mw690/88e90961ly1hwvqdknjo4j20u0140tav.jpg'
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
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }
    }
  }
}
</style>
