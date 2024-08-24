import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import animated from "animate.css";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./assets/css/index.css";
import "./assets/css/iconfont.css";
import "./assets/css/markdown.css";
import "./assets/css/vue-social-share/client.css";
import config from "./assets/js/config";
import Share from "vue-social-share";
import dayjs from "dayjs";
import {vueBaberrage} from "vue-baberrage";
import axios from "axios";
import VueAxios from "vue-axios";
import InfiniteLoading from "vue-infinite-loading";
import "highlight.js/styles/atom-one-dark.css";
import VueImageSwipe from "vue-image-swipe";
import "vue-image-swipe/dist/vue-image-swipe.css";
import Toast from "./components/toast/index";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

Vue.prototype.config = config;
Vue.config.productionTip = false;
Vue.use(animated);
Vue.use(Share);
Vue.use(vueBaberrage);
Vue.use(InfiniteLoading);
Vue.use(VueAxios, axios);
Vue.use(VueImageSwipe);
Vue.use(Toast);
Vue.use(ElementUI);
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs
import hljs from 'highlight.js';

VMdPreview.use(vuepressTheme, {
    Hljs: hljs,
});

Vue.use(VMdPreview);
Vue.filter("date", function (value) {
    return dayjs(value).format("YYYY-MM-DD");
});

Vue.filter("year", function (value) {
    return dayjs(value).format("YYYY");
});

Vue.filter("hour", function (value) {
    return dayjs(value).format("HH:mm:ss");
});

Vue.filter("time", function (value) {
    return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
});

Vue.filter("num", function (value) {
    if (value >= 1000) {
        return (value / 1000).toFixed(1) + "k";
    }
    return value;
});

router.beforeEach((to, from, next) => {
    NProgress.start();
    if (to.meta.title) {
        document.title = to.meta.title;
    }
    next();
});

router.afterEach(() => {
    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
    NProgress.done();
});
//添加一个请求拦截器，在请求头中加token
axios.interceptors.request.use(
    function (config) {
        let token = store.getters.getToken;
        if (token) {
            config.headers[token.tokenName] = token.tokenValue;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);
axios.interceptors.response.use(
    function (response) {
        if (response.data.code != 200) {
            switch (response.data.code) {
                case 50000:
                    Vue.prototype.$toast({type: "error", message: "系统异常"});
                    break;
                default:
                    Vue.prototype.$toast({type: "error", message: response.data.message});
                    break;
            }
        }

        return response;
    },
    function (error) {
        return Promise.reject(error);
    }
);

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount("#app");
