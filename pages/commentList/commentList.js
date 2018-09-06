import { isArray } from '../../utils/util.js'
const app = getApp()


Page({
    data: {
        commentList: [],
        totalPage: 1,
        currentPage: 1
    },
    previewImages: function (e) {
        let { id, dataset } = e.currentTarget
        wx.previewImage({
            current: id,
            urls: dataset.imgarr
        })
    },
    getCommentList: function (first,page) {
        app.wxRequest({
            showLoading: first ? true : false,
            data: {
                m: 'goods',
                a: 'comment',
                page: page
            },
            success: (res) => {
                let { comments, totalPage } = res.data
                comments.map((d, i) => {
                    let colors = []
                    d.goods.map((d,i1) => {
                        colors.push(d.goods_attr.split(':')[1].split('音箱')[1].split('-')[0])
                    },this)
                    comments[i].colors = colors.join('、')
                    isArray(d.thumb) && d.thumb.map((d,i1) => {
                        comments[i].thumb[i1] = app.globalData.hostUrl + d
                    },this)
                    if (!isArray(d.thumb)) {
                        comments[i].thumb = []
                    }
                    comments[i].add_show_time = comments[i].add_time.split(' ')[0]
                    comments[i].user_picture = comments[i].user_picture.indexOf('http') > -1 ||  comments[i].user_picture.indexOf('https') > -1 ? comments[i].user_picture : app.globalData.hostUrl + comments[i].user_picture
                },this)
                this.setData({
                    currentPage: page,
                    commentList: [...this.data.commentList,...comments],
                    totalPage
                })
            }
        })
    },
    onReachBottom: function () {
        let { currentPage, totalPage } = this.data
        currentPage < totalPage && this.getCommentList(true,this.data.currentPage + 1)
    },
    onLoad: function () {
       this.getCommentList(false,this.data.currentPage)
    }
})