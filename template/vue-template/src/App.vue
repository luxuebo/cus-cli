<template>
   <div class='app'>
      <Title></Title>
      <Content></Content>
   </div>
</template>
<script>
import Title from './component/title'
import Content from './component/content'
export default {
    name: "component_name",
    data () {
       return {
       };
    },
    components:{
        Title,
        Content
    },
    mounted (){
    },
    methods:{
    },
}
</script>
<style scoped>
</style>