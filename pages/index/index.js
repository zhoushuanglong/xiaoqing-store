const util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        imgUrls: [
            {
                img_url: '../../img/swiper1.jpg',
            },
            // {
            //     img_url: '../../img/swiper2.png',
            // }
        ],
        list: [{
            img_url: '../../img/red.png',
            // name: ' 小青人工智能动听音箱',
            color: '熔岩红',
            // price: 1299,
            // oPrice: 1599,
            desc: '预定特惠'
        },{
            img_url: '../../img/blue.png',
            // name: ' 小青人工智能动听音箱',
            color: '深海蓝',
            // price: 1299,
            // oPrice: 1599,
            desc: '预定特惠'
        },{
            img_url: '../../img/white.png',
            // name: ' 小青人工智能动听音箱',
            color: '冰雪白',
            // price: 1299,
            // oPrice: 1599,
            desc: '预定特惠'
        },{
            img_url: '../../img/usa.png',
            // name: ' 小青人工智能动听音箱',
            colors: ['美国','../../img/america.png','现场限量版'],
            // price: 1599,
            desc: '仅10台'
        }],
        flag: false,
        error: 4, //是否领券
        isOverTime: +new Date('2018-02-26T00:00:00') - +new Date() <= 0 ? true : false,
        show: true
    },
    close: function (e) {
        this.setData({
            show: false,
            first: false
        })
    },
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
          // 来自页面内转发按钮
        }
        return {
          title: '小青商城',
          path: '/pages/index/index',
          imageUrl: '../../img/cover.jpg',
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
    },
    toDetail: function (e) {
        if (this.data.flag) {
            return
        }
        this.setData({
            flag: true
        })
        e.currentTarget.id ? app.globalData.goodsId = e.currentTarget.id : null
        wx.navigateTo({
            url: '../detail/detail'
        })
    },
    onLoad: function (option) {
        let { userId } = app.globalData
        let { su_id, su_t } = option
        // console.log(wx.getStorageSync('first') === '')
        
        // if (option.su_id && su_id !== userId) {
            this.setData({
                option: option
            })
        // } 
    },
    onShow: function () {
        let t = new Date()
        this.videoCtl = wx.createVideoContext('myVideo', this)
        this.setData({
            flag: false
        })
        wx.getStorageSync('goodsId') && wx.removeStorageSync('goodsId')
        wx.getStorageSync('url') && wx.removeStorageSync('url')
        wx.getStorageSync('specification') && wx.removeStorageSync('specification')
        wx.getStorageSync('address') && wx.removeStorageSync('address')
        // app.wxRequest({
        //     data: {
        //         m:'affiche',
        //         a:'list',
        //         noid: true
        //     },
        //     success: (res) => {
        //         let { data } = res.data
        //         data.map((d, i) => {
        //             d.img_url = d.ad_code.indexOf('http') > -1 || d.ad_code.indexOf('https') > -1 ? d.ad_code : app.globalData.hostUrl + d.ad_code 
        //         })
        //         this.setData({
        //             imgUrls: data
        //         })
        //     }
        // })
        
        app.wxRequest({
            data: {
                m: 'goods'
            },
            success: (res) => {
                let { goods_price, marketPrice, goods_name } = res.data.data.goods
                let { list } = this.data
                let {su_id, su_t} = this.data.option
                let userId = res.data.data.user_id
                list.map((d, i) => {
                    d.name = goods_name
                    if (i === 3) {
                        d.price = parseFloat(marketPrice).toFixed(0)
                    } else {
                        if (goods_price != marketPrice) {
                            d.oPrice = parseFloat(marketPrice).toFixed(0) 
                        }
                        d.price = parseFloat(goods_price).toFixed(0) 
                    }
                }, this)
                if (!this.data.option) {
                    // wx.showModal({
                    //     title: `${wx.getStorageSync('first')}`
                    // })
                    // if (app.globalData.first === '') {
                    //     this.setData({
                    //         first: 0
                    //     })
                    // } 
                    // else if (app.globalData.first === 1) {
                    //     wx.showModal({
                    //         title: '提示',
                    //         content: '尊敬的小青用户，您已领过新用户优惠券，请您尽快使用。'
                    //     })
                    // }
                } else if (app.globalData.getCou == false && su_id != userId && su_id !==undefined) {
                    
                    app.wxRequest({
                        data: {
                            m: 'coupont',
                            a: 'GetCoupon',
                            su_id: su_id,
                            t: su_t,
                        },
                        success: (res) => {
                            // wx.showModal({
                            //     title: '提示',
                            //     content: res.data.error
                            // })
                            // console.log(res.data.error)
                            app.globalData.getCou = true
                            if (res.data.error == 0) {
                                this.setData({
                                    error: res.data.error,
                                    couInfo: res.data.data
                                })
                            } else if (res.data.error == 2) {
                                wx.showModal({
                                    title: '提示',
                                    content: '尊敬的小青商城会员，您已领过该优惠券，请您尽快使用。'
                                })
                            } else {
                                wx.showModal({
                                    title: '提示',
                                    content: '系统出现错误请稍后再试～'
                                })
                            }
                        },
                        fail: (error) => {
                            wx.showModal({
                                title: '领券失败，请稍后再试～'
                            })
                        }
                    })
                }
                this.setData({
                    list
                })
            }
        })
    }
})
