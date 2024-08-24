<template>
  <div><h1>登录中</h1></div>
</template>

<script>
export default {
  data: function() {
    return {};
  },
  computed: {},
  methods: {},
  created() {
    const that = this;
    //关闭登录框
    that.$store.state.loginFlag = false;
    const params = new URLSearchParams(window.location.search);
    const userDetailParams = params.get("userDetail");
    if (userDetailParams) {
      const userDetail = JSON.parse(decodeURIComponent(userDetailParams));
      // 这里可以将用户对象保存到本地或进行其他操作
      console.log(userDetail);
      //保存登录状态
      that.$store.commit("login", userDetail);
      if (userDetail.email == null) {
        that.$toast({
          type: "warnning",
          message: "请绑定邮箱以便及时收到回复"
        });
      }
    }
    // 跳转回原页面
    const loginUrl = that.$store.state.loginUrl;
    if (loginUrl != null && loginUrl !== "") {
      that.$router.push({ path: loginUrl });
    } else {
      that.$router.push({ path: "/" });
    }
  }
};
</script>

<style scoped></style>
