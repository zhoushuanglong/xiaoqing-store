//获取应用实例
const app = getApp()
let WxParse = require('../../wxParse/wxParse.js');

Page({
    data: {
        title:'',
        id:0
    },
    onLoad: function () {
        let that = this
        let { id, title } = wx.getStorageSync('helpDetail')
        this.setData({
            id,
            title
        })
        wx.removeStorageSync('helpDetail')
        wx.setNavigationBarTitle({
            title: this.data.title
        })
        app.wxRequest({
            data: {
                m: 'article',
                a: 'detail',
                article_id: this.data.id
            },
            success: (res) => {
                let { data } = res
                if (data.error) {
                    wx.showModal({
                        title: '提示',
                        content: data.msg,
                        showCancel: false,
                        success: function () {
                            wx.navigateBack()
                        }
                    }) 
                    return
                }
                WxParse.wxParse('article', 'html', data.article.content, that, 5)
                // this.setData({
                //     nodes: data.article.content
                // })
            }
        })
    }
})