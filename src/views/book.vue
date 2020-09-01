<template>
  <div>
    <div id="reader-overlay"></div>

    <van-popup v-model="showLeftDrawer" position="left" :style="{ width: '80%',height:'100%' }">
      <van-tabs type="card">
        <van-tab title="目录">
          <bookmenu v-bind:menuList="toc" v-bind:currentMenu="chapter" @change="changeChapter"></bookmenu>
        </van-tab>
        <!--    <van-tab title="书签">内容 2</van-tab>
              <van-tab title="笔记">内容 3</van-tab>
              -->
      </van-tabs>

    </van-popup>

    <van-popup v-model="popupShow" position="top" :style="{ height: '30%' }" class="reader-tool">
      <div>
        <van-row class="tool-row">
          <van-col span="4">亮度</van-col>
          <van-col span="16">
            <van-slider v-model="light" @change="onLightChange" />
          </van-col>
        </van-row>
        <van-row class="tool-row">
          <van-col span="4">字号</van-col>
          <van-col span="16">
            <van-stepper v-model="fontSize" @change="onFontSizeChange" min="10" max="24" input-width="40px" button-size="32px" step="2" disable-input />
          </van-col>
        </van-row>

      </div>

    </van-popup>

    <div v-if="loading" class="loading-overlay">
      <img v-if="firstLoading" id="CoverImg" :src="coverimg" />
      <div v-if="firstLoading" style="color:gray;position:absolute;bottom:12px;width:100%;text-align:center;height:20px;">加载中...</div>
      <van-loading color="#1989fa" />
    </div>

    <div style="height: 100vh">
      <van-nav-bar v-bind:title="chapter.label" left-text="" right-text="章节" @click-right="onClickRight"></van-nav-bar>
      <div id="viewer">
        <div style="position: absolute;left:0;font-size: 50px;z-index: 1234;top: 50%;width:50px;height:50px" @click="prevPage()" v-if="mql==1 || mqlFlage== true">
          <img src="../assets/left.png" alt="" style="width:100%;height:100%">
        </div>
        <div style="position: absolute;right:0;font-size: 50px;z-index: 1234;top: 50%;width:50px;height:50px" @click="nextPage()" v-if="mql==1 || mqlFlage==true"><img src="../assets/right.png" alt="" style="width:100%;height:100%"></div>
      </div>
    </div>

    <div id="page-overlay" :class="pageAnimationClass">{{ pageText }}</div>
    <div id="page-overlay-bar">
      <div id="page-overlay-process" :style="{ height:'3px', backgroundColor:'red' ,width : pageProcess + '%'}">
      </div>
    </div>

    <div class="errorMask" v-if="maskFlag">{{errorMaskText}}</div>
  </div>

</template>
<style scoped>
.errorMask {
  width: 100%;
  height: 100%;
  font-size: 40px;
  font-weight: bold;
  text-align: center;
  padding-top: 20px;
  position: fixed !important;
  top: 0;
  left: 0;
  background: #fff;
  z-index: 10001;
  letter-spacing: 2px;
}
.fadeout {
  -webkit-animation: fadeout 0.6s linear 0s normal 1 forwards;
  animation: fadeout 0.6s linear 0s normal 1 forwards;
}

@-webkit-keyframes fadeout {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@keyframes fadeout {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

#page-overlay {
  position: absolute;
  bottom: 6px;
  text-align: right;
  height: 12px;
  left: 0;
  right: 5px;
  z-index: 1000;
  font-size: 10px;
}
#page-overlay-bar {
  position: absolute;
  bottom: 3px;
  height: 2px;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: gray;
}

#CoverImg {
  width: 90%;
  padding-top: 5%;
}
.loading-overlay {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0;
  right: 0;
  z-index: 10000;

  text-align: center;
  background-color: white;
}
.tool-row {
  /*height: 40px;*/
  text-align: center;
  line-height: 40px;
}
.van-popup > div {
  padding: 10px;
}
.van-slider {
  margin: 20px;
}
#reader-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0);
  pointer-events: none;
}
.backImage {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 30px;
  margin-top: 5px;
  border: 1px solid #dfdfdf;
}
.bg-timg4 {
  background: url("/readerImages/css_sprites.png") -10px -10px;
}
.bg-timg3 {
  background: url("/readerImages/css_sprites.png") -70px -10px;
}
.bg-timg1 {
  background: url("/readerImages/css_sprites.png") -10px -70px;
}
.bg-timg {
  background: url("/readerImages/css_sprites.png") -70px -70px;
}
</style>
<script>
import { Image, Tab, Tabs, Loading, NavBar, CellGroup, Cell, Card, RadioGroup, Radio, Popup, Progress, Row, Col, Slider, Stepper } from 'vant';
import bookmenu from '@/components/bookmenu';
import Vue from 'vue';
import Epub from 'epubjs';
import axios from 'axios';
Vue.use(NavBar).use(Loading).use(Card)
  .use(RadioGroup).use(Radio).use(CellGroup)
  .use(Cell).use(Tabs).use(Tab).use(Popup).use(Progress)
  .use(Row).use(Col).use(Slider).use(Stepper).use(Image);
var book, rendition;
export default {
  name: 'book',
  components: {
    bookmenu: bookmenu
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      book: null,
      beginBasePage: 2,
      pageText: "",
      pageProcess: 0,
      currentPage: 1,
      currentChaperIdx: 2,
      rendition: null,
      chapter: {},
      changeType: "menu",
      firstLoad: true,
      loading: true,
      popupShow: false,
      showLeftDrawer: false,
      light: 100,
      locationLoading: true,
      firstLoading: true,
      maskFlag: false,
      errorMaskText: "",
      fontSize: 14,
      backImage: "",
      toc: [],
      backImageList: [
        { class: "bg-timg", backImagesrc: "readerImages/timg_big.jpg" },
        { class: "bg-timg1", backImagesrc: "readerImages/timg1_big.jpg" },
        { class: "bg-timg3", backImagesrc: "readerImages/timg3_big.jpg" },
        { class: "bg-timg4", backImagesrc: "" },
      ],
      readerStyle: {
        light: 100,
        fontSize: 14,
        backImage: ""
      },
      pageAnimationClass: "",
      coverimg: "",
      mql: "",
      mqlFlage: false
    }
  },
  watch: {
    toc: {
      handler: function (oldVal, newVal) {
        // console.log(newVal)
      },
      deep: true
    },
    chapter: function (val) {
      if (this.changeType == "menu")
        rendition.display(val.href);
    },
    fontSize: function (val) {
      this.onFontSizeChange(val);
    },
    light: function (val) {
      this.onLightChange(val);
    },
    backImage: function (val) {
      this.onBackImageChange(val);
    },
    mql: function (val) {
      this.mql = val;
      localStorage.setItem("mql", this.mql)
    }
  },
  methods: {
    // 点击下一页
    nextPage() {
      rendition.next();
    },
    // 点击上一页
    prevPage() {
      if (this.currentPage == 1 && book.package.metadata.direction != "rtl" && this.currentChaperIdx <= 2) return; //第一页禁止继续向前
      rendition.prev();
    },
    onClickLeft() {
      window.history.back(-1);
      // book
    },
    onClickRight() {
      this.showLeftDrawer = true;
    },
    onLightChange(val) {
      var overlay = document.getElementById("reader-overlay");
      overlay.style.backgroundColor = "rgba(0,0,0," + (0.5 - val / 200) + ")";
      this.readerStyle.light = val;
    },
    onFontSizeChange(val) {
      // 判断横屏竖屏展示不同字体大小
      var mql = window.matchMedia("(orientation: portrait)");
      if (mql.matches) {
        // 竖屏
        // this.fontSize = 15;
        // this.readerStyle.fontSize = 15;
        this.mql = "0";
      } else {
        // 横屏
        // this.fontSize = 22;
        // this.readerStyle.fontSize = 22;
        this.mql = "1";
      }
      var iframeDoc = document.getElementsByTagName("iframe")[0].contentWindow.document;
      var fontSizeStyle = iframeDoc.getElementById("fontSize");
      if (!fontSizeStyle) {
        fontSizeStyle = iframeDoc.createElement('style');
        fontSizeStyle.id = "fontSize";
        fontSizeStyle.type = 'text/css';
        fontSizeStyle.innerHTML = "p,div{ font-size:" + val + "px }";
        iframeDoc.getElementsByTagName('HEAD').item(0).appendChild(fontSizeStyle);
      } else {
        fontSizeStyle.innerHTML = "p,div{ font-size:" + val + "px }";
      }
      if (this.readerStyle.fontSize != val) {
        this.readerStyle.fontSize = val;
        // this.locationLoading = true;
        // let that = this;
        // book.locations.generate(666).then(function(location) { // This promise will take a little while to return (About 20 seconds or so for Moby Dick)
        //     that.locationLoading = false;
        //     that.pageText = (that.beginBasePage + that.currentPage) + "/" + book.locations.total;
        // });
      }
    },
    onBackImageChange(val) {
      var iframeDoc = document.getElementsByTagName("iframe")[0].contentWindow.document;
      var bdoy = iframeDoc.getElementsByTagName("body")[0];
      bdoy.style.backgroundImage = val;
      this.readerStyle.backImage = val;
    },
    changeBackImage(value) {
      if (value.backImagesrc)
        this.backImage = "url('" + this.publicPath + value.backImagesrc + "')";
      else
        this.backImage = "";
    },
    updateStyle() {
      this.onLightChange(this.readerStyle.light);
      this.onBackImageChange(this.readerStyle.backImage);
      this.onFontSizeChange(this.readerStyle.fontSize);
    },
    changeChapter(chapter) {
      this.changeType = "menu";
      this.showLeftDrawer = false;
      this.chapter = chapter;
    },
  },
  beforeCreate: function () {
    // ajax()  
    document.title = "图书阅读";
    var that = this;
    var bookfile = this.$route.params.pathMatch;
    var paramValue = bookfile.split("/");
    if (paramValue.length < 3) {
      that.$nextTick(function () {
        that.maskFlag = true;
        //todo 参数错误
        that.errorMaskText = "参数错误";
      })
      return;
    }
    var token = paramValue[2];
    if (token.indexOf("t=") == -1) {
      //校验t
      axios
        .get("/REST/api/checkepubToken?token=" + token)
        .then(res => {
          if (!res.data) {
            that.$nextTick(function () {
              that.maskFlag = true;
              that.errorMaskText = "无效token";
            })
            return;
          }
        });
    }
    bookfile = paramValue[0] + "/" + paramValue[1];
    var bookoption = {};
    if (!/.epub$/.test(bookfile) && bookfile != undefined) {
      bookoption.openAs = 'directory';
    }
    book = new Epub(bookfile+"/", bookoption);
    rendition = book.renderTo("viewer", {
      width: "100%"
    });
    book.ready.then(function () {
      that.coverimg = book.cover;
      return book.locations.generate(719); // Generates CFI for every X characters (Characters per/page)
      // }
    }).then(function (locations) { // This promise will take a little while to return (About 20 seconds or so for Moby Dick)
      that.locationLoading = false;
      let location = viewManager.currentLocation();
      let p = location[0].pages[0];
      that.pageText = that.beginBasePage;
      that.pageAnimationClass = "";
      that.beginBasePage = that.beginBasePage - p;
    });
    var viewManager;
    rendition.on("started", function () {
      viewManager = rendition.manager;
      viewManager.on("beforeCreateView", function (section) {
        that.loading = true;
      })
      viewManager.on("afterCreateView", function (view) {
        view.hooks.content.register(function (iframe) {
          that.updateStyle();
        })
      })
    })
    rendition.on("rendered", function (section) {
      if (viewManager.currentLocation()[0].pages.length >= 2) {
        that.mqlFlage = !that.mqlFlage
        localStorage.setItem("mql", "1")
      } else {
        that.mqlFlage = false
        localStorage.setItem("mql", "0")
      }
      // mqlFlage
      if (!that.locationLoading) {
        let location = viewManager.currentLocation();
        let p = location[0].pages[0];
        that.beginBasePage = book.locations.locationFromCfi(rendition.currentLocation().start.cfi) - p;
      }
      if (that.firstLoading) {
        //location（为了分页的页码计算） 还在计算中的话，稍等一会儿在关闭loading页面
        setTimeout(function () { that.loading = false; that.firstLoading = false }, 4500);
      } else {
        that.loading = false;
      }
      let current = book.navigation && book.navigation.get(section.href);
      that.currentChaperIdx = section.index;
      if (that.chapter.href != current.href) {
        that.changeType = "turnPage";
        that.chapter = current;
      }

      var mql = window.matchMedia("(orientation: portrait)");
      var iframe = document.getElementsByTagName("iframe")[0].contentWindow.document;
      var viewport = iframe.getElementsByTagName("html")[0];
      var container = document.getElementById("viewer").firstElementChild;
      var startScrollLeft;
      var pageWidth = window.innerWidth; // 页面宽度
      var maxWidth = pageWidth / 2;
      var startX, startY;
      var initialPos = 0;  // 手指按下的屏幕位置
      var moveLength = 0;  // 手指当前滑动的距离
      var direction = 'left'; // 滑动的方向
      var isMove = false; // 是否发生左右滑动
      var startT = 0; // 记录手指按下去的时间
      var isTouchEnd = true; // 标记当前滑动是否结束(手指已离开屏幕)
      var throttleTime = 0;
      var lastScroll, totalPages;
      that.currentPage = 0;
      // let location = viewManager.currentLocation();
      // that.currentPage = location[0].pages[0]; 
      if (mql.matches) {
        this.mql = "0"
      } else {
        this.mql = "1"
      }
      if (mql.matches) {
        // 手指放在屏幕上
        viewport.addEventListener('touchstart', function (e) {
          startScrollLeft = container.scrollLeft;
          let location = viewManager.currentLocation();
          totalPages = location[0].totalPages;
          //that.currentPage = location[0].pages[0];  
          //touchstart与touchend的浏览器默认行为不能阻止，
          // 如果阻止的话则浏览器无法计算该节点内的点击等其他事件
          //e.preventDefault();
          // 单手指触摸或者多手指同时触摸，禁止第二个手指延迟操作事件
          if (e.touches.length === 1 || isTouchEnd) {
            var touch = e.touches[0];
            startX = touch.pageX;
            startY = touch.pageY;
            lastScroll = 0;
            startT = + new Date(); // 记录手指按下的开始时间
            isMove = false; // 是否产生滑动
            isTouchEnd = false; // 当前滑动开始
          }
        }, { passive: false });
        // 手指在屏幕上滑动，页面跟随手指移动
        viewport.addEventListener('touchmove', function (e) {
          e.preventDefault();
          //用于频繁滑动防抖
          // var now = new Date().getTime();
          // if(!throttleTime) throttleTime=now;
          // if(now-throttleTime<20) return;
          // throttleTime = now;
          // 如果当前滑动已结束，不管其他手指是否在屏幕上都禁止该事件
          if (isTouchEnd) return;
          var touch = e.touches[0];
          //container scroll改变时touch.pageX也会跟着变，所以需要减掉容器滚动的距离获取真正的手指移动距离。
          var scrolltemp = container.scrollLeft - startScrollLeft;
          var deltaX = touch.pageX - startX - scrolltemp;

          direction = deltaX > 0 ? 'right' : 'left'; // 判断手指滑动的方向
          // if(that.chapter.href==that.toc[0].href&&direction=='right'&&currentPage==1) return;
          isMove = true;
          moveLength = deltaX;
          scrollPage.call(viewport, moveLength, e);
          //如果滑动距离超过最大距离则翻页
          if (Math.abs(moveLength) >= maxWidth) {
            throttleTime = 0;
            turnPage.call(viewport, moveLength);
          }
        }, { passive: false });

        // 手指离开屏幕时，计算最终需要停留在哪一页
        viewport.addEventListener('touchend', function (e) {
          if (!isMove) {
            isTouchEnd = true;
            if (e.target.tagName == "A" || e.target.parentNode.tagName == "A") return;
            e.preventDefault();
            that.popupShow = true;
            return;
          }
          throttleTime = 0;
          var translate = 0;
          // 计算手指在屏幕上停留的时间
          var deltaT = + new Date() - startT;
          // 发生了滑动，并且当前滑动事件未结束
          if (isMove && !isTouchEnd) {
            isTouchEnd = true; // 标记当前完整的滑动事件已经结束
            // 使用动画过渡让页面滑动到最终的位置
            if (deltaT < 300) { // 如果停留时间小于300ms,则认为是快速滑动，无论滑动距离是多少，都停留到下一页
              turnPage.call(viewport, moveLength);
            } else {
              // 如果滑动距离小于屏幕的50%，则退回到上一页
              if (Math.abs(moveLength) < maxWidth) {
                // 执行滑动，让页面恢复
                scrollPage.call(viewport, 0);
                isTouchEnd = true;
              } else {
                // 如果滑动距离大于屏幕的50%，则翻页
                turnPage.call(viewport, moveLength);
              }
            }
          }
        }, { passive: false });
      }
      function turnPage(moveLength) {
        isTouchEnd = true;
        this.style.webkitTransform = 'translate3d(0, 0, 0)';
        if (direction === "left") {
          if (book.package.metadata.direction === "rtl") {
            rendition.prev(moveLength);
            //that.currentPage--;
          } else {
            rendition.next(moveLength);
            //that.currentPage++;
          }
        } else {
          if (that.currentPage == 1 && book.package.metadata.direction != "rtl" && that.currentChaperIdx <= 2) return; //第一页禁止继续向前
          if (book.package.metadata.direction === "rtl") {
            rendition.next(moveLength);
            //that.currentPage++;
          } else {
            rendition.prev(moveLength);
            //that.currentPage--;
          }
        }
      }
      // 页面平移
      function scrollPage(translate, type) {
        if (that.currentPage == 1 && direction === "right" || that.currentPage == totalPages && direction === "left") {
          this.style.webkitTransform = 'translate3d(' + translate + 'px, 0, 0)';
        } else {
          container.scrollLeft = startScrollLeft - translate;
        }
      }
    });
    rendition.on("relocated", function (locations) {
      //console.log("relocated location",locations);
      // When navigating to the next/previous page
      //let progress = book.locations.percentageFromCfi(locations.start.cfi);
      // console.log('Progress:', progress); // The % of how far along in the book you are
      // console.log('Current Page:',book.locations.locationFromCfi(locations.start.cfi));
      // console.log('Total Pages:',book.locations.total);
      that.pageAnimationClass = "fadeout";
      setTimeout(
        function () {
          let location = viewManager.currentLocation();
          that.currentPage = location[0].pages[0];
          // that.currentPage - 1;
          let total = book.locations.total;
          if (that.locationLoading && total < 70) { //加载中，且刚开始加载的时候，如果估算已经大于70页了，也尝试一下
            that.pageText = "";
            that.pageProcess = 0;
            that.pageAnimationClass = "";
            return;
          }
          let progress = book.locations.percentageFromCfi(locations.start.cfi);
          that.pageProcess = parseInt(progress * 100);
          if (total < that.beginBasePage + location[0].totalPages) total = that.beginBasePage + location[0].totalPages;
          // let showpage = that.beginBasePage + that.currentPage;
          // let calpage = book.locations.locationFromCfi(locations.start.cfi);
          // console.log('showpage:', showpage);  
          // console.log('calpage:', calpage); 
          //if (calpage>total) total=calpage;
          //有链接跳转的时候，这是currentPage是不对的
          // if ( Math.abs(calpage - showpage)>1 ){
          //     that.currentPage = calpage - showpage;
          //     showpage = calpage;
          // }
          let showpage = that.beginBasePage + that.currentPage;
          //if (showpage>total) showpage=total;
          //that.pageText = showpage  +  "/" + total;
          that.pageText = showpage;
          that.pageAnimationClass = "";
        }, 400);
    });
    rendition.on("layout", function (layout) {
      //   console.log("layout", layout);
    });
    rendition.on("locationChanged", function (obj) {
      // index (number)
      // href (string)
      // start (EpubCFI)
      // end (EpubCFI)
      // percentage (number)
      //   console.log("locationChanged", obj);
    });
    book.loaded.navigation.then(function (toc) {
      that.chapter = toc.toc[0];
      that.toc = toc.toc;
    });
  },
  destroyed: function () {
    book.destroy();
  },
  mounted() {

  },
  created() {

  }
}
</script>

<style>
.van-stepper__input[disabled] {
  color: black;
}
</style>