<template>
    <VueMarkdown :source="md"></VueMarkdown>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Vue } from 'vue-property-decorator';
    import VueMarkdown from 'vue-markdown';

    @Component({
        components: {
            VueMarkdown
        }
    })
    export default class Help extends Vue {
        md: string = "";

        created() {
            let _this = this;

            $.get("readme.md").then(t => {
                _this.md = t;
            });
        }
    }
</script>

<style>
</style>
