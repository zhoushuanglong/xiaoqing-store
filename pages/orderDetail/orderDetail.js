//orderDetail.js
//获取应用实例
const app = getApp()

Page({
    data: {
       order:null,
       order_id:0,
       goods_list:null,
       real_amount:0,
       paying: false,
       canceling: false,
       adding: false,
       isOverDeadLine: app.globalData.deadline - +new Date() < 0 ? true : false
    },
    addToCart: function (e) {
        const This = this
        let { goods_attr_id, goods_number } = e.currentTarget.dataset.item
        if (this.data.adding) {
            return
        }
        this.setData({
            adding: true
        })
        app.wxRequest({
            data: {
                m: 'cart',
                a: 'add_to_cart',
                goods: {
                    "number": goods_number,
                    "spec": [goods_attr_id],
                    "goods_id": app.globalData.goodsId
                }
            },
            success: function (res) {
                if (res.data.error === 0){
                    wx.reLaunch({
                        url: '../cart/cart'
                    })
                } else {
                    wx.showModal({
                        title: res.data.message
                    })
                    this.setData({
                        adding: false
                    })
                }
            },
            fail: function () {
                this.setData({
                    adding: false
                })
            }
        })
    },
    goDetail: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        wx.reLaunch({
            url: '../index/index',
            success: () => {
                wx.navigateTo({
                    url:'../detail/detail'
                })
            }
        })
    },
    goLogistics: function (e) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let { id, dataset } = e.currentTarget
        let { shippingname, invoice_no, addrdetail, address } = dataset
        wx.setStorageSync('logisticsInfo',{
            id,
            invoice_no,
            shippingname,
            addrdetail,
            address
        })
        wx.navigateTo({
            url: '../logistics/logistics'
        })
    },
    call: function () {
        wx.makePhoneCall({
            phoneNumber: app.globalData.phoneNumber
        })
    },
    confirm: function (e) {
        if (this.data.canceling) {
            return
        }
        this.setData({
            canceling: true
        })
        wx.showModal({
            title: '提示',
            content: '确认收货',
            success: (res) => {
                if (!res.confirm) {
                    this.setData({
                        canceling: false
                    })
                    wx.hideModal()
                } else {
                    app.wxRequest({
                        data: {
                            m: 'user',
                            c: 'order',
                            a: 'affirm_received',
                            order_id: e.currentTarget.id
                        },
                        success: (res) => {
                            if (res.error) {
                                this.setData({
                                    canceling: false
                                })
                                wx.showToast({
                                    title: '确认失败',
                                    image: '../../img/close.png',
                                    during: 2000
                                })
                                setTimeout(() => {
                                    wx.hideToast()
                                }, 2000)
                                return
                            }
                            this.setData({
                                canceling: false,
                                order:{
                                    ...this.data.order,
                                    shipping_status: '已收货',
                                    commented: 0
                                }
                            })
                        }
                    })
                }
            }
        })
    },
    cancel: function(e) { 
        if (this.data.canceling) {
            return
        }
        this.setData({
            canceling: true
        })
        wx.showModal({
            title: '提示',
            content: '确定取消订单',
            success: (res) => {
                if (!res.confirm) {
                    this.setData({
                        canceling: false
                    })
                } else {
                    let cancelHandle = new Promise((resolve, reject) => {
                        app.wxRequest({
                            data: {
                                m: 'user',
                                c: 'order',
                                a: 'cancel',
                                order_id: e.currentTarget.id,
                            },
                            success: (res) => {
                                resolve(res)
                            },
                            fail: (res) => {
                                wx.showModal({
                                    title: '取消失败,请联系客服～'
                                })
                                this.setData({
                                    canceling: false
                                })
                                reject(res)
                            },
                        })
                    })
            
                    cancelHandle.then((data) => {
                        if(data.error==1){
                            this.setData({
                                canceling: false
                            })
                            wx.showModal({
                                title: '取消失败,请联系客服～'
                            })
                            return
                        }
                        wx.showModal({
                            title: data.msg
                        })
                        wx.navigateTo({
                            url: '../myOrder/myOrder'
                        })
                    }, function (value) {
                        // failure
                    })
                }
                
            }
        })
    },
    pay: function (e) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let codePromise = new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    resolve({
                        order_id:e.currentTarget.id,
                        code:res.code
                    })
                },
                fail: (res) => {
                    wx.showModal({
                        title: '提示',
                        content: '支付失败，请您稍后再试(错误代码：002)'
                    })
                    this.setData({
                        paying: false
                    })
                    reject(res)
                }
            })
        })

        let payPromise = codePromise.then((data)=>{
            return new Promise((resolve, reject) => {
                app.wxRequest({
                    data: {
                        m:'weixin',
                        order_id: data.order_id,
                        code: data.code
                    },
                    success: (res) => {
                        if (res.data.jsApiParameters){
                            resolve(res.data)
                        } else {
                            wx.showModal({
                                title: '提示',
                                content: '支付失败，请您稍后再试(错误代码：003)'
                            })
                            this.setData({
                                paying: false
                            })
                            reject('error')
                        }
                    },
                    fail: (res) => {
                        wx.showModal({
                            title: '提示',
                            content: '支付失败，请您稍后再试(错误代码：033)'
                        })
                        this.setData({
                            paying: false
                        })
                        reject(res)
                    },
                })
            })
        }) 

        payPromise.then((data) => {
            let This = this
            wx.requestPayment({
                ...JSON.parse(data.jsApiParameters),
                success: (res) => {
                    This.setData({
                        order: {
                            ...This.data.order,
                            order_status: '已确认',
                            shipping_status: '未发货',
                            pay_status: '已付款'
                        }
                    })
                },
                fail: (res) => {
                    if(res.errMsg.indexOf('requestPayment:fail (') > -1) {
                        wx.showModal({
                            title: '提示',
                            content: '支付失败，请您稍后再试(错误代码：004)'
                        })
                    }
                    this.setData({
                        paying: false
                    })
                },
            })
        })
    },
    onShow: function () {
        this.setData({
            paying: false
        })
    },
    addComment: function (e) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let { colorarr, goods_list, order_goods_num, order_id } = e.currentTarget.dataset
        wx.setStorageSync('goods_info',{
            goods_attr: colorarr.join('、'),
            goods_name: goods_list[0].goods_name,
            goods_img: goods_list[0].goods_img,
            goods_number: order_goods_num,
            order_id: order_id
        })
        wx.navigateTo({
            url: '../commentEdit/commentEdit'
        })
    },
    onLoad: function (option) {
        let { commented, order_goods_num } = option
        this.setData({
            order_id: wx.getStorageSync('order_id')
        })
        wx.removeStorageSync('order_id')
        this.setData({
            colorArr: wx.getStorageSync('colorArr')
        })
        wx.removeStorageSync('colorArr')
        let orderPromise = new Promise((resolve,) => {
            app.wxRequest({
                data: {
                    m:'user',
                    c:'order',
                    a:'detail',
                    order_id:this.data.order_id
                },
                success: (res) => {
                    let data = res.data
                    if (data.error) {
                        wx.showModal({
                            title: data.msg,
                            success: function () {
                                wx.navigateBack()
                            }
                        }) 
                        return
                    }

                    data.order.cou_fee = data.order.coupons[0] ? data.order.coupons[0].cou_money : parseInt('0').toFixed(2)

                    data.goods_list && data.goods_list.map((d, i) => {
                        d.goods_img = app.globalData.hostUrl + d.attr_thumb
                        d.goods_money = parseFloat(d.goods_price.split('¥')[1]).toFixed(2)
                        d.goods_color = d.goods_attr ? d.goods_attr.indexOf(':小青音响') > -1 ? `(${d.goods_attr.split(':小青音响')[1].split('-')[0]})` : `(${d.goods_attr.split(':')[1].split('音箱')[1].split('-')[0]})` : ''
                    })
                    
                    resolve({...res.data})
                    this.setData({...res.data,order_goods_num: order_goods_num,commented:commented})
                }
            })
        })

        orderPromise.then((data) => {
            let { invoice_no, shipping_name } = data.order
            if (invoice_no) {
                app.wxRequest({
                    data: {
                        m:'user',
                        c: 'order',
                        a: 'logistics',
                        com: shipping_name || '顺丰速递',
                        nu: invoice_no
                    },
                    success: (res) => {
                        this.setData({state: res.data.state})
                    }
                })
            }
        })
        
    }
})
