<template>
    <div class="menuList">
        <van-divider/>
        <div class="bookmenuItem" v-for="(item,index) in menuList" :key="item.name">
            <span class="bookmenu-icon"><van-icon v-bind:name="item.subitems.length?item.iconName:''" @click="toggleMenu(item,index)"/></span>
            <span class="bookmenu-label" v-bind:itemHref="item.href" @click="changeChapter(item)">
                <span>{{item.label}}</span>
            </span>
            <bookmenu v-show="item.subitems.length&&item.isOpen" v-bind:menuList="item.subitems" @change="onChangeChapter"></bookmenu>
            <van-divider v-if="index!=menuListLength-1"/>
        </div>
    </div>
</template>

<script>
    /**注意jquery需要在vue组件mount挂载el标签之后使用，且nodejs环境下无window对象，browser环境下无所谓**/
    import $ from "jquery";
    import Vue from 'vue';
    import { Icon,Divider  } from 'vant';

    Vue.use(Icon).use(Divider);

    export default {
        name: "bookmenu",
        props:{
            menuList:Array,
            currentMenu:Object
        },
        data(){
            return{
                menuListLength:this.menuList.length
            }
        },
        beforeMount(){
            this.parseMenuList(this.menuList);
        },
        watch:{
            currentMenu:function (newVal,oldVal) {
                $("[itemHref='"+oldVal.href+"']").removeClass("active");
                $("[itemHref='"+newVal.href+"']").addClass("active");
            }
        },
        methods:{
            parseMenuList:function(menuList){
                //最初进入嵌套组件进行数据初始化
                if(menuList.length&&!menuList[0].parent){
                    for(var idx=0;idx<menuList.length;idx++){
                        var item=menuList[idx];
                        item.iconName="";
                        item.isOpen=false;
                        if(item.subitems&&item.subitems.length){
                            item.iconName="arrow";
                            this.parseMenuList(item.subitems);
                        }
                    }
                }
            },
            //点击当前层触发
            changeChapter:function (item) {
                this.$emit('change',item);
            },
            //监听传递子层
            onChangeChapter:function(item){
                this.$emit('change',item);
            },
            toggleMenu(item,idx){
                if(item.isOpen){
                    item.isOpen=false;
                    item.iconName = 'arrow'
                } else{
                    item.isOpen=true;
                    item.iconName = 'arrow-down'
                }
                //触发数组内容变动的监听
                this.menuList.splice(idx, 1, item);
            }
        }
    }
</script>

<style scoped>
    .menuList{
        font-size: 14px;
    }
    .menuList .menuList{
        padding-left: 20px;
    }
    .menuList .active{
        color: red;
    }
    .bookmenu-icon{
        display: inline-block;
        width: 10%;
    }
    .bookmenu-label{
        width: 90%;
        display: inline-block;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
    }
</style>