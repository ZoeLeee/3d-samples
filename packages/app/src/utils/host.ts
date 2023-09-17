export const CDN_URL = "https://cdn.jsdelivr.net/gh/ZoeLeee/cdn@master/blog/";
export const CDN_IMG_URL = "https://cdn.jsdelivr.net/gh/ZoeLeee/cdn@master/img/blog/";
export const CDN_VIDEO_URL = "https://cdn.jsdelivr.net/gh/ZoeLeee/cdn@master/video/";


const protocol = location.protocol;
export const CURRENT_HOST = protocol === "http:" ? "http://api.dodream.wang:3000/api/" : "https://www.dodream.wang/api/";

export const ArticleApi = {
    Article: CURRENT_HOST + "article",
    Upload: CURRENT_HOST + "upload",
    List: CURRENT_HOST + "articles",
};