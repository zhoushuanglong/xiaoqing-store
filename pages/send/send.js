const app = getApp()

Page({
    data: {},
    onLoad: function () {
        
    },
    onShareAppMessage: function (res) {
        let { goodsId, userId } = app.globalData
        let t = Math.floor(+ new Date() / 1000)
        console.log(t,userId)
        if (res.from === 'button') {
        // 来自页面内转发按钮
        }
        app.wxRequest({
            data: {
                m: 'coupont',
                a: 'ShareCoups',
                t: t
            },
            success: (res) => {
                console.log(res)
            }
        })
        return {
            title: '送您一张VIP特权券',
            path: `/pages/index/index?su_id=${userId}&su_t=${t}`,
            imageUrl: '../../img/cover1.jpg',
            success: function(res) {
                wx.showToast({
                    title: '已发送',
                    icon: 'success',
                    duration: 1000
                })
                wx.showShareMenu({
                    // 要求小程序返回分享目标信息
                    withShareTicket: true
                })
            },
            fail: function(res) {
                // 转发失败
                wx.showToast({
                    title: '发送失败',
                    icon: 'fail',
                    duration: 1000
                })
            }
        }
    }
})