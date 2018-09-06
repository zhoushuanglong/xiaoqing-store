//addressList.js
//获取应用实例
const app = getApp()

Page({
    data: {
        default_address: '',
        address_list: [],
        startX: 0,
        delBtnWidth: app.currentPixel(100),
        paying: false
    },
    bindedit: function (e) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let { address_id, consignee, mobile, province, city, district, address } = e.currentTarget.dataset.item
        let addressInfo =  Object.assign({},{},{
            address_id,
            consignee,
            mobile,
            province_region_id: province,
            city_region_id: city,
            district_region_id: district,
            address: address.split(' ')[1],
            checked: e.currentTarget.id === 'default' ? 1 : 0,
            flag: e.currentTarget.id === 'default' ? false : true
        })
        wx.setStorageSync('address',addressInfo)
        wx.setStorageSync('url','../addressManage/addressManage')
        wx.navigateTo({
            url:'../addressEdit/addressEdit'
        })
    },
    toedit: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        wx.setStorageSync('address',{flag:this.data.address_list === '' && this.data.default_address === '' ? false : true, checked: this.data.address_list === '' && this.data.default_address === '' ? 1 : 0})
        wx.setStorageSync('url','../addressManage/addressManage')
        wx.navigateTo({
            url:'../addressEdit/addressEdit'
        })
    },
    touchS: function (e) {
       if ( e.touches.length == 1){  
            this.setData({
                startX: e.touches[0].pageX
            })
        }
    },
    touchM: function (e) {
        if ( e.touches.length > 1){
            return
        }
        const moveX = e.touches[0].pageX
        const disX = this.data.startX - moveX
        const delBtnWidth = this.data.delBtnWidth
        let swiperPixel = 0
        let cur = e.currentTarget.id.indexOf('default') > -1 ? this.data.default_address : this.data.address_list[e.currentTarget.id]
        if (Math.abs(cur.swipePixel) !== delBtnWidth) {
            if (disX >= 0) {
                swiperPixel = -disX
                if (disX <= delBtnWidth) {
                    if (e.currentTarget.id.indexOf('default') > -1) {
                        let default_address = this.data.default_address
                        default_address.swiperPixel = swiperPixel
                        this.setData({
                            default_address: default_address
                        })
                    } else {
                        let address_temp = this.data.address_list
                        address_temp[e.currentTarget.id].swiperPixel = swiperPixel
                        this.setData({
                            address_list: address_temp
                        })
                    }
                }
            }
        }
    },
    touchE: function (e) {
        if (e.changedTouches.length == 1) {
            const endX = e.changedTouches[0].pageX
            const disX = this.data.startX - endX
            const delBtnWidth = this.data.delBtnWidth
            let swiperPixel = 0
            let cur = e.currentTarget.id.indexOf('default') > -1 ? this.data.default_address : this.data.address_list[e.currentTarget.id]
            if (disX > delBtnWidth / 2) {
                swiperPixel = -delBtnWidth
            } else {
                swiperPixel = 0
            }

            if (e.currentTarget.id.indexOf('default') > -1) {
                let default_address = this.data.default_address
                default_address.swiperPixel = swiperPixel
                this.setData({
                    default_address: default_address
                })
            } else {
                let address_temp = this.data.address_list
                address_temp[e.currentTarget.id].swiperPixel = swiperPixel
                this.setData({
                    address_list: address_temp
                })
            }
            

        }
    },
    delItem: function (e) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        app.wxRequest({
            data: {
                m:'flow',
                a:'address_delete',
                address_id:e.currentTarget.id
            },
            success: () => {
                if(e.currentTarget.dataset.key === 'default') {
                    this.setData({
                        default_address: '',
                        paying: false
                    })
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success',
                        duration: 2000
                    })
                } else {
                    let address_list = this.data.address_list
                    address_list.splice(e.currentTarget.dataset.key,1)
                    this.setData({
                        address_list: address_list,
                        paying: false
                    })
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success',
                        duration: 2000
                    })
                }
            }
        })
    },
    onShow: function () {
        let This = this
        wx.getStorageSync('url') && wx.removeStorageSync('url')
        wx.getStorageSync('address') && wx.removeStorageSync('address')
        this.setData({
            paying: false
        })
        app.wxRequest({
            data: {
                m:'flow',
                a:'address_list'
            },
            success: (res) => {
                let data = res.data
                let index = null , default_address
                data.data !== '' && data.consignee_list.map((d, i) => {
                    d.mobileStr = d.mobile.replace(d.mobile.slice(3,7),'****')
                    if (d.address_id === data.defulte_id) {
                        index = i
                        default_address = d
                    }
                })
                index !== null && data.consignee_list.splice(index,1)
                This.setData({
                    address_list: data.consignee_list || '',
                    default_address: default_address || ''
                })
            }
        })
    }
})
