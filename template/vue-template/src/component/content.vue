<template>
   <div class='content'>
       <el-button type='primary'>主要按钮</el-button>
       <div class="le">less</div>
   </div>
</template>
<script>
export default {
    name: "component_name",
    data () {
       return {
       };
    },
    components:{
    },
    mounted (){
    },
    methods:{
    },
}
</script>
<style scoped lang='less'>
.le{
    color:red;
}
</style>