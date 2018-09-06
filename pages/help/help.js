//user.js
//获取应用实例
const app = getApp()

Page({
    data: {
       helpList: [],
       flag: true,
       paying: false
    },
    readMore: function () {
        if (this.data.paying) {
            return
        }

        this.setData({
            paying: true
        })
        app.wxRequest({
            data: {
                m: 'article'
            },
            success: (res) => {
                this.setData({
                    helpList: res.data.list,
                    flag: false,
                    paying: false
                })
            },
            fail: () => {
                this.setData({
                    paying: false
                })
            }
        })
    },
    toHelpDetail: function (e) {
        if (this.data.paying) {
            return
        }

        this.setData({
            paying: true
        })
        let { id, title } = e.currentTarget.dataset.info
        wx.setStorageSync('helpDetail',{
            id,
            title
        })
        wx.navigateTo({
            url: `../helpDetail/helpDetail`
        })
    },
    onShow: function () {
        this.setData({
            paying: false
        })
    },
    onLoad: function () {
        app.wxRequest({
            data: {
                m: 'article',
                type: 'json'
            },
            success: (res) => {
                this.setData({
                    helpList: res.data.list.slice(0,4)
                })
            }
        })
    }
})


