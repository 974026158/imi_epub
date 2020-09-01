<template>
  <div>

    <van-card v-for="item in bookList" desc="描述信息" v-bind:title="item.name" v-bind:thumb="publicPath+item.imgSrc" :key="item.name">
      <div slot="footer">
        <van-button size="mini">加入收藏</van-button>
        <van-button size="mini" @click="read(item)">开始阅读</van-button>
      </div>
    </van-card>
  </div>
</template>

<script>
// @ is an alias to /src
import { Button, Card } from 'vant';
import Vue from 'vue';

Vue.use(Button);
Vue.use(Card);

export default {
  name: 'home',
  data() {
    return {
      publicPath: process.env.BASE_URL,
      bookList: [
        {
          url: 'epub/倾听马克思_B_52070130_001.epub',
          name: '陈桥驿全集（第七卷）',
          imgSrc: 'bookImages/下载1.jpg'
        }, {
          url: 'epub/“一国两制”在香港、澳门的成功实践及其历史经验研究_B_01016279_001.epub',
          name: '“一国两制”在香港、澳门的成功实践及其历史经验研究',
          imgSrc: 'bookImages/下载2.jpg'
        }, {
          url: 'epub/倾听马克思_B_52070130_001.epub',
          name: '倾听马克思',
          imgSrc: 'bookImages/下载3.jpg'
        }, {
          url: 'epub/增强“四个意识”六讲_B_01016551_001.epub',
          name: '增强“四个意识”六讲',
          imgSrc: 'bookImages/下载4.jpg'
        }, {
          url: 'epub/漫话四个全面_B_01016786_001/',
          name: '漫话四个全面',
          imgSrc: 'bookImages/下载6.jpg'
        }, {
          url: 'epub/青年们,读马克思吧!：一个20多岁青年人的探索与热情_B_52070068_001.epub',
          name: '青年们,读马克思吧!：一个20多岁青年人的探索与热情',
          imgSrc: 'bookImages/下载5.jpg'
        }, {
          url: 'epub/马克思恩格斯全集（第十九卷）_B_1963_000030.epub',
          name: '马克思恩格斯全集（第十九卷）',
          imgSrc: 'bookImages/下载17.jpg'
        }
      ]

    }
  },
  methods: {
    read(book) {
      this.$router.push("book/" + book.url);
    }

  }
}
</script>
