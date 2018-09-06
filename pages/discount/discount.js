// discount.js
//  获取应用实例
const app = getApp()

Page({
    data: {
        total: 1,
        currentPage: 1,
        coupons: [],
        paying: false
    },
    cancel : function () {
        if (this.data.paying) {
            return
        }

        this.setData({
            paying: true
        })
        app.wxRequest({
            data: {
                m: 'flow',
                a: 'ChangeCoupont',
                cou_id: '0'
            },
            success: (res) => {
                wx.navigateBack({
                    url: '../paySettle/paySettle'
                })
            },
            fail: () => {
                this.setData({
                    paying: false
                })
            }
        })
    },
    useCoupon: function (e) {
        if (this.data.paying) {
            return
        }

        this.setData({
            paying: true
        })
        let This = this
        app.wxRequest({
            data: {
                m: 'flow',
                a: 'ChangeCoupont',
                cou_id: e.currentTarget.id
            },
            success: (res) => {
                wx.navigateBack({
                    url: '../paySettle/paySettle'
                })
            },
            fail: () => {
                This.setData({
                    paying: false
                })
            }
        })
    },
    getCoupons: function (page) {
        let This = this
        app.wxRequest({
            data: {
                m: 'flow',
                a: 'GetUserCouon',
                ...wx.getStorageSync('discount'),
                page: page
            },
            success: (res) => {
                let { totalPage, user_coupons } = res.data
                let coupons = []
                for (const key in user_coupons) {
                    coupons.push(user_coupons[key])
                }
                This.setData({
                    coupons: [...This.data.coupons,...coupons],
                    total: totalPage,
                    currentPage: page
                })
            }
        })
    },
    onReachBottom: function () {
        let { currentPage, total } = this.data
        currentPage < total && this.getCoupons(this.data.currentPage + 1)
    },
    onShow: function () {
        this.setData({
            paying: false
        })
    },
    onLoad: function () {
        this.getCoupons(this.data.currentPage)
    }
})