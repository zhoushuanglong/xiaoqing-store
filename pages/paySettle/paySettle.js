//index.js
//获取应用实例
const app = getApp()
import { isArray } from '../../utils/util'

Page({
    data: {
        paying: false,
        goods_list:[],
        ru_id: 0,
        cart_value: '',
        ru_name: '',
        uc_id: 0,
        goods_price:0,
        cou_fee:0,
        shipping_fee:0,
        amount: 0,
        address: '',
        address_id: null,
        time: ['不限制配送时间','工作日配送','周末配送'],
        index: '0',
        inv_info: []
    },

    pay: function () {
        let { ru_id, ru_name, index, address_id } = this.data

        if (this.data.paying) {
            return
        }

        this.setData({
            paying: true
        })

        if (!address_id) {
            wx.showModal({
                title: '您还未添加配送地址',
                success: () => {
                    this.setData({
                        paying: false
                    }) 
                }
            })
            return
        }
        
        let orderPromise = new Promise((resolve,reject) => {

            let { inv_info, cart_value } = this.data
            let obj = cart_value === '' ? {quick_order:1} : {}
            
            let  data = inv_info !== '' ? {
                address_id: address_id,
                uc_id: this.data.uc_id,
                shipping_dateStr: this.data.time[index],
                invoice_id: inv_info.invoice_id,
                ...obj
            } : {
                address_id: address_id,
                uc_id: this.data.uc_id,
                shipping_dateStr: this.data.time[index],
                ...obj
            }
            app.wxRequest({
                data: {
                    m:'flow',
                    a: 'done',
                    ru_id,
                    ru_name,
                    shipping: 2,
                    shipping_type: 0,
                    vc_id: 0,
                    store_id: 0,
                    ...data
                },
                success: (res) => {
                    if (res.data.order_id){
                        resolve(res.data)
                    } else {
                        this.setData({
                            paying: false
                        })
                        wx.showModal({
                            title: '提示',
                            content: '支付失败，请您稍后再试(错误代码：001)'
                        })
                        reject('error')
                    }
                },
                fail: (res) => {
                    this.setData({
                        paying: false
                    })
                    wx.showModal({
                        title: '提示',
                        content: '支付失败，请您稍后再试(错误代码：011)'
                    })
                    reject(res)
                }
            })
        })

        let codePromise = orderPromise.then((data) => {
            return new Promise((resolve, reject) => {
                wx.login({
                    success: (res) => {
                        resolve({
                            order_id:data.order_id,
                            code:res.code
                        })
                    },
                    fail: (res) => {
                        this.setData({
                            paying: false
                        })
                        wx.showModal({
                            title: '提示',
                            content: '支付失败，请您稍后再试(错误代码：002)'
                        })
                        reject(res)
                    }
                })
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
                            wx.removeStorageSync('goodsId')
                            resolve(res.data)
                        } else {
                            this.setData({
                                paying: false
                            })
                            wx.showModal({
                                title: '提示',
                                content: '支付失败，请您稍后再试(错误代码：003)'
                            })
                            reject('error')
                        }
                    },
                    fail: (res) => {
                        this.setData({
                            paying: false
                        })
                        wx.showModal({
                            title: '提示',
                            content: '支付失败，请您稍后再试(错误代码：033)'
                        })
                        reject(res)
                    },
                })
            })
        }) 

        payPromise.then((data) => { 
            wx.requestPayment({
                ...JSON.parse(data.jsApiParameters.trim()),
                success: (res) => {
                    setTimeout(() => {
                        wx.reLaunch({
                            url: '../user/user',
                            success: () => {
                                wx.navigateTo({
                                    url: '../myOrder/myOrder'
                                })
                            }
                        })
                    }, 500);
                },
                fail: (res) => {
                    if(res.errMsg.indexOf('requestPayment:fail (') > -1) {
                        this.setData({
                            paying: false
                        })
                        wx.showModal({
                            title: '提示',
                            content: '支付失败，请您稍后再试(错误代码：004)'
                        })
                    } else {
                        setTimeout(() => {
                            wx.reLaunch({
                                url: '../user/user',
                                success: () => {
                                    wx.navigateTo({
                                        url: '../myOrder/myOrder'
                                    })
                                }
                            })
                        }, 500);
                    }
                },
            })
        })
    },

    bindPickerChange: function (e) {
        this.setData({
            index: e.detail.value
        })
    },

    toAddress: function (e) {
        if (this.data.paying) {
            return
        }

        this.setData({
            paying: true
        })
        let {address, address_id} = this.data
        wx.setStorageSync('selectedAddress',{
            address,
            address_id
        })
        wx.navigateTo({url:'../addressList/addressList'})
    },

    toInvoice: function (e) {
        if (this.data.paying) {
            return
        }

        this.setData({
            paying: true
        })
        let { inv_info, amount } = this.data
        wx.setStorageSync('invoice',{
            inv_info,
            amount
        })
        wx.navigateTo({url:'../invoice/invoice'})
    },
    
    toDiscount: function () {
        if (this.data.paying) {
            return
        }

        this.setData({
            paying: true
        })
        wx.setStorageSync('discount',{
            total_goods_price: this.data.goods_price,
            cart_value: this.data.cart_value
        })
        wx.navigateTo({
            url: '../discount/discount'
        })
    },

    onShow: function () {
        this.setData({
            paying: false
        })
        const payPromise = new Promise((resolve, reject) => {
            app.wxRequest({
                data: {
                    m:'flow',
                    cart_value: wx.getStorageSync('goodsId') ? wx.getStorageSync('goodsId').join(',') : '',
                    quick_order: 1
                },
                success: (res) => {
                    if (res.statusCode === 200) {
                        resolve({...res.data.data,cart_value: wx.getStorageSync('goodsId') ? wx.getStorageSync('goodsId').join(',') : ''})
                    }
                },
                fail: (res) => {
                    reject(res)
                }
            })
        })

        payPromise.then((obj) => {
            let goods_list = []
            let { inv_info } = obj
            let {address, mobile,consignee, region, address_id} = obj.consignee
            let { ru_id, ru_name,  } = obj.goods_list[0]
            let { goods_price, shipping_fee, amount } = obj.total
            let { cart_value } = obj
            let { cou_id } = obj.order
            shipping_fee = shipping_fee.toFixed(2)
            goods_price = goods_price.toFixed(2)
            amount = amount.toFixed(2)
            obj.goods_list[0].goods_list.map((d, i) => { 
                d.goods_color = d.goods_attr !== '' ? (d.goods_attr.indexOf(':小青音响') > -1 ? `(${d.goods_attr.split(':小青音响')[1].split('-')[0]})` : `(${d.goods_attr.split(':')[1].split('音箱')[1].split('-')[0]})`) : ''
                d.goods_img = app.globalData.hostUrl + d.attr_thumb
                goods_list.push(d)  
            },this)
            this.setData({
                ru_id,
                ru_name,
                cart_value,
                goods_list,
                address_id,
                goods_price,
                amount: amount,
                shipping_fee,
                address:isArray(obj.consignee) ? '': `${consignee} ${mobile} ${region.replace(/\s+/g,'')}${address}`,
                cou_fee: !isArray(obj.order_coupont)  ? parseFloat(obj.order_coupont.cou_money).toFixed(2) : parseFloat('0').toFixed(2),
                uc_id: cou_id,
                inv_info:isArray(inv_info) ? '' : {...inv_info,inv_Type:inv_info.inv_type === '1' ? '电子普票' : '普通发票'}
            })
            wx.getStorageSync('discount') && wx.removeStorageSync('discount')
            if ( wx.getStorageSync('selectedAddress')) {
                this.setData({
                    address: wx.getStorageSync('selectedAddress').address,
                    address_id: wx.getStorageSync('selectedAddress').address_id
                })
                wx.removeStorageSync('selectedAddress')
            } 
        })
    }
})
