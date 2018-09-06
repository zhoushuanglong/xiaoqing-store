const app = getApp()

Page({
    data: {
        pageHeight: wx.getSystemInfoSync().windowHeight - app.currentPixel(190),
        data:[],
        state:0,
        success:undefined,
    },
    call: function (e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.id 
        })
    },
    onLoad: function (option) {
        let This = this
        let shippingname, invoice_no
        if (wx.getStorageSync('logisticsInfo')) {
            shippingname = wx.getStorageSync('logisticsInfo').shippingname
            invoice_no = wx.getStorageSync('logisticsInfo').invoice_no
            this.setData({
                ...wx.getStorageSync('logisticsInfo')
            })
            wx.removeStorageSync('logisticsInfo')
        } else {
            shippingname = option.shippingname
            invoice_no = option.invoice_no
            let { id } = option
            this.setData({
                invoice_no,
                shippingname,
                id
            })
            app.wxRequest({
                data: {
                    m:'user',
                    c:'order',
                    a:'detail',
                    order_id:id
                },
                success: (res) => {
                    let data = res.data
                    let  { detail_address, shipping_name } = res.data.order
                    
                    This.setData({
                        addrdetail: detail_address
                    })
                }
            })
        }

        wx.showLoading({
            title: '加载中...'
        })
        app.wxRequest({
            //url: '/plugins/kuaidi/express.php',
            //method: 'post',
            data: {
                m:'user',
                c: 'order',
                a: 'logistics',
                com: shippingname || '顺丰速递',
                nu: invoice_no
            },
            success: (res) => {
                wx.hideLoading()
                let reg = /1[34578]\d{9}/

                // 快递100
                // let { data, state, status } = res.data
                // parseInt(status) === 1 && data.map((d, i) => {
                //     if (reg.test(d.context) ) {
                //         data[i].hasPhoneNumber = true
                //         let info = reg.exec(d.context)
                //         let arr = info.input.split(info[0])
                //         arr.splice(1,0,info[0])
                //         data[i].phoneBefore = arr[0]
                //         data[i].phoneNumber = arr[1]
                //         data[i].phoneAfter = arr[2]
                //     } else {
                //         data[i].hasPhoneNumber = false
                //     }
                // })
                // this.setData({
                //     data,
                //     state,
                //     status
                // })

                // 快递鸟

                let { data, state, success } = res.data
                if (success && data.length === 0) {
                    data = ''
                } 
                if (success && data !== '') {
                    data = data.reverse()
                    data.map((d, i) => {
                        if (reg.test(d.AcceptStation)) {
                            data[i].hasPhoneNumber = true
                            let info = reg.exec(d.AcceptStation)
                            let arr = info.input.split(info[0])
                            arr.splice(1,0,info[0])
                            data[i].phoneBefore = arr[0]
                            data[i].phoneNumber = arr[1]
                            data[i].phoneAfter = arr[2]
                        }
                    })
                }
                
                this.setData({
                    data,
                    state,
                    success
                })

            }
        })
    }
})