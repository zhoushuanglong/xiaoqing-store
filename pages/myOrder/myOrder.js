//myOrder.js
//获取应用实例
const app = getApp()

Page({
    data: {
        paying: false,
        order_list: undefined,
        currentPage: 1,
        total: 1,
        pageHeight: app.globalData.pageHeight - app.currentPixel(100),
        isOverDeadLine: app.globalData.deadline - +new Date() < 0 ? true : false
    },
    toDetail: function (e) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        // console.log(e.currentTarget.dataset)
        wx.setStorageSync('order_id',e.currentTarget.id)
        wx.setStorageSync('colorArr',e.currentTarget.dataset.colorarr)

        wx.navigateTo({
            url: e.currentTarget.dataset.commented !== undefined  ? `../orderDetail/orderDetail?commented=${e.currentTarget.dataset.commented}&order_goods_num=${e.currentTarget.dataset.order_goods_num}` : `../orderDetail/orderDetail`
        })
    },
    logistics: function (e) {
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
            url: `../logistics/logistics`
        })
    },
    addComment: function (e) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let { item } = e.currentTarget.dataset
        wx.setStorageSync('goods_info',{
            goods_attr: item.colorArr.join('、'),
            goods_name: item.order_goods[0].goods_name,
            goods_img: item.order_goods[0].goods_img,
            goods_number: item.order_goods_num,
            order_id: item.order_id
        })
        wx.navigateTo({
            url: '../commentEdit/commentEdit'
        })
    },
    goBuy: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        wx.reLaunch({
            url:'../index/index',
            success: () => {
                wx.navigateTo({
                    url:'../detail/detail'
                })
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
                    let temp = This.data.order_list
                    temp[e.currentTarget.dataset.index].orderStatus = '等待收货'
                    This.setData({
                        order_list: temp
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
    getOrderList: function (first,page) {
        let This = this
        app.wxRequest({
            showLoading: first ? false : true,
            data: {
                m: 'user',
                c: 'order',
                status: 0,
                page: page || 1
            },
            success: function (res) {
                let order_list = res.data.order_list
                order_list.map((d, i) => {
                    let status = d.order_status
                    if (status === '未确认,未付款,未发货' || status === '未确认,付款中,未发货' || status === '已确认,未付款,未发货') {
                        d.orderStatus = '等待付款'
                    } else if (status === '已确认,已付款,未发货' || status === '已确认,已付款,配货中') {
                        d.orderStatus = '等待发货'
                    } else if ( status === '已确认,已付款,已发货') {
                        d.orderStatus = '等待收货'
                    } else if (status === '已完成') {
                        d.orderStatus = '交易成功'
                    } else if (status === '已取消,未付款,未发货' || status === '退货,未付款,未发货' ) {
                        d.orderStatus = '交易取消'
                    }
                    d.colorArr = []
                    d.total_amount = parseFloat(d.total_fee.split('¥')[1]).toFixed(2)
                    
                    d.order_goods.map((d1, i) => {
                        d1.goods_img = app.globalData.hostUrl + d1.attr_thumb
                        d1.goods_amount = parseFloat(d1.goods_price.split('¥')[1]).toFixed(2)
                        d1.goods_color = d1.goods_attr ? d1.goods_attr.indexOf(':小青音响') > -1 ? `(${d1.goods_attr.split(':小青音响')[1].split('-')[0]})` : `(${d1.goods_attr.split(':')[1].split('音箱')[1].split('-')[0]})` : ''
                        let color = d1.goods_color === '' ? '' : d1.goods_color.split('(')[1].split(')')[0]
                        d.colorArr.push(color)
                    })
                })
                This.setData({
                    order_list: !first ? [...This.data.order_list,...res.data.order_list] : res.data.order_list,
                    total: res.data.totalPage,
                    currentPage: page
                })
            }
        })
    },
    onReachBottom: function () {
        let { currentPage, total } = this.data
        currentPage < total && this.getOrderList(false,this.data.currentPage + 1)
    },
    onShow: function () {
        this.setData({
            currentPage: 1,
            total: 1,
            paying: false
        })
        wx.getStorageSync('order_id') && wx.removeStorageSync('order_id')
        this.getOrderList(true,this.data.currentPage)
    }
})
