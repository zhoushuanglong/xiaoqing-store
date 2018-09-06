const app = getApp()

Page({
    data: {
        amount: 0,
        inv_payee: '个人',
        tax_id:'',
        inv_personal: '0',
        inv_type: '0',
        content: '电器数码',
        phone: '',
        email: '',
        inv_Type: '普通发票',
        paying: false
    },
    switch: function (e) {
        let { id } = e.currentTarget
        switch (id) {
            case '电子普票':
                this.setData({
                    inv_type: '1'
                })
                break
            case '普通发票':
                this.setData({
                    inv_type: '0'
                })
                break
            case '个人':
                this.setData({
                    inv_personal: '0'
                })
                break
            case '单位':
                this.setData({
                    inv_personal: '1'
                })
                break
        }
    },
    toNegotiate: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        wx.navigateTo({
            url: '../invioceNegotiate/invioceNegotiate'
        })
    },
    textChange: function (e) {
        switch (e.currentTarget.id) {
            case 'inv_payee':
                this.setData({
                    inv_payee: e.detail.value
                })
                break
            case 'tax_id':
                this.setData({
                    tax_id: e.detail.value
                })
                break
            case 'phone':
                this.setData({
                    phone: e.detail.value
                })
                break
            case 'email':
                this.setData({
                    email: e.detail.value
                })
                break
        }
    },
    verify: function (reg,text,msg) {
        if (!reg.test(text)) {
            wx.showModal({
                title: msg
            })
            return false
        }
        return true
    },
    bindSubmit: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let This = this
        let phoneReg = /^[1]{1}[34578]{1}\d{9}$/
        let emailReg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/
        let { 
            invoice_id,
            inv_payee,
            tax_id,
            inv_personal,
            inv_type,
            content,
            phone,
            email,
            inv_Type 
        } = this.data
        let data = {}
        if (inv_type === '0') {
            if (inv_personal === '0') {
                data = invoice_id ? {
                    inv_type,
                    inv_personal,
                    id: invoice_id,
                    content
                } : {
                    inv_type,
                    inv_personal,
                    content,
                    noid: true
                }
            } else {
                let test = this.verify(/^\S+$/,inv_payee,'请输入单位名称')
                if (!test) {
                    this.setData({
                        paying: false
                    })
                    return
                }
                test = this.verify(/^[a-zA-Z1-9]{1}[a-zA-Z0-9]+$/,tax_id,'请输入正确的税号')
                if (!test) {
                    this.setData({
                        paying: false
                    })
                    return
                }
                data = invoice_id ? {
                    inv_type,
                    inv_personal,
                    id: invoice_id,
                    content,
                    inv_payee,
                    tax_id
                } : {
                    inv_type,
                    inv_personal,
                    content,
                    inv_payee,
                    tax_id,
                    noid: true
                }

            }
        } else {
            if (inv_personal === '0') {
                let test = this.verify(phoneReg,phone,'请输入正确的手机号码')
                if (!test) {
                    this.setData({
                        paying: false
                    })
                    return
                }
                test = this.verify(emailReg,email,'请输入正确的邮箱')
                if (!test) {
                    this.setData({
                        paying: false
                    })
                    return
                }
                data = invoice_id ? {
                    inv_type,
                    inv_personal,
                    id: invoice_id,
                    content,
                    phone,
                    email
                } : {
                    inv_type,
                    inv_personal,
                    content,
                    phone,
                    email,
                    noid: true
                }
            } else {
                let test = this.verify(/^\S+$/,inv_payee,'请输入单位名称')
                if (!test) {
                    this.setData({
                        paying: false
                    })
                    return
                }
                test = this.verify(/^[a-zA-Z1-9]{1}[a-zA-Z0-9]+$/,tax_id,'请输入正确的税号')
                if (!test) {
                    this.setData({
                        paying: false
                    })
                    return
                }
                test = this.verify(phoneReg,phone,'请输入正确的手机号码')
                if (!test) {
                    this.setData({
                        paying: false
                    })
                    return
                }
                test = this.verify(emailReg,email,'请输入正确的邮箱')
                if (!test) {
                    this.setData({
                        paying: false
                    })
                    return
                }
                data = invoice_id ? {
                    inv_type,
                    inv_personal,
                    id: invoice_id,
                    content,
                    inv_payee,
                    tax_id,
                    phone,
                    email
                } : {
                    inv_type,
                    inv_personal,
                    content,
                    inv_payee,
                    phone,
                    email,
                    noid: true
                }
            }
        }
        app.wxRequest({
            data: {
              ...data,
              m: 'flow',
              a: 'change_need_inv',
            },
            success: (res) => {
                if (res.data.error === 0)
                    wx.navigateBack()
                else 
                    This.setData({
                        paying: false
                    })
            },
            fail: () => {
                This.setData({
                    paying: false
                })
            }
        })
    },
    onShow: function () {
        this.setData({
            paying: false
        })
    },
    onLoad: function () {
        let { inv_info, amount } = wx.getStorageSync('invoice')
        if (inv_info !== '')
            this.setData({
                ...inv_info, 
                amount
            },() => {
                wx.removeStorageSync('invoice')
            })
        else 
            this.setData({
                amount
            },() => {
                wx.removeStorageSync('invoice')
            }) 
    }
})