import axios from "axios";
//根据这个this.axios.post("https://tenapi.cn/v2/acg/", { format: "json" })获取随机封面
export const getCover = () => {
  return axios.post("https://tenapi.cn/v2/acg/", { format: "json" });
};
