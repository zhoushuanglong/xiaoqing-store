//addressEdit.js
//获取应用实例
const app = getApp()

Page({
    data: {
        address_id:undefined,
        consignee: '',
        mobile: '',
        province_region_id: '',
        city_region_id: '',
        district_region_id: '',
        address: '',
        checked: 1,
        province_region_ids: [],
        province_region_names: [],
        city_region_ids: [],
        city_region_names: [],
        district_region_ids: [],
        district_region_names: [],
        province_index:0,
        city_index:0,
        district_index: 0,
        focus_address: false,
        focus_consignee: false,
        focus_mobile: false,
        change: false,
        checkboxChange: false,
        paying: false
    },
    focus: function (e) {
        switch (e.currentTarget.id) {
            case 'focus_consignee':
                this.setData({
                    focus_consignee: true
                })
                break
            case 'focus_mobile':
                this.setData({
                    focus_mobile: true
                })
                break
            case 'focus_address':
                this.setData({
                    focus_address: true
                })
                break
        }
    },
    bindSubmit: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let This = this
        let url = wx.getStorageSync('url')
        let flag = false
        wx.removeStorageSync('address')
        if( !this.data.address_id || this.data.change || this.data.checkboxChange) {
            var reg = /^1[34578]\d{9}$/
            let { consignee, mobile, province_region_id, city_region_id, district_region_id, address, address_id, checked} = this.data
            let data = Object.assign({},{},{
                consignee, 
                mobile, 
                province_region_id,
                city_region_id, 
                district_region_id,
                address,
                address_id,
                is_default: checked
            })

            for (var key in data) {
                if (key === 'consignee') {
                    if ( data[key] === '') {
                            flag = true
                            wx.showModal({
                                title: '请填写收货人姓名',
                                showCancel:true,
                                success: function(res) {
                                    flag = false
                                    This.setData({
                                        focus_consignee: true
                                    })
                                }
                            }) 
                            break 
                        }
                        
                    }
                if (key === 'mobile') {
                    if (!reg.test(data[key]) || data[key] === '') { 
                        flag = true 
                        wx.showModal({
                            title: data[key] === '' ? '请填写手机号码' : '手机号码格式不正确',
                            showCancel:true,
                            success: function(res) {
                                flag = false
                                This.setData({
                                    focus_mobile: true
                                })
                            }
                        }) 
                        break
                    }
                }
                if (key === 'address') {
                    if (data[key] === '') {
                        flag = true
                        wx.showModal({
                            title: '请填写街道地址',
                            showCancel:true,
                            success: function(res) {
                                flag = false
                                This.setData({
                                    focus_address: true
                                })
                            }
                        })
                        break
                    } 
                }
            }
            if(flag) {
                this.setData({
                    paying: false
                })
                return
            }
            app.wxRequest({
                data:Object.assign({},{
                    m:'flow',
                    a:'store_address'
                },data),
                success: (res) => {
                    if (res.data.status === 'y')
                        wx.navigateBack({
                            url:url
                        })
                    else {
                        This.setData({
                            submiting: false
                        })
                        wx.showModal({
                            title: '编辑地址失败'
                        })
                    }
                },
                fail: (err) => {
                    This.setData({
                        submiting: false
                    })
                    wx.showModal({
                        title: '编辑地址失败'
                    })
                }
            })
        } else {
            wx.navigateBack({
                url:url
            })
        }
    },
    bindinput: function (e) {
        switch (e.currentTarget.id) {
            case 'consignee':
                if(this.data.change === false) {
                    this.setData({
                        consignee:e.detail.value,
                        change: true
                    })
                } else {
                    this.setData({
                        consignee:e.detail.value,
                    })
                }
                break
            case 'mobile':
                if(this.data.change === false) {
                    this.setData({
                        mobile:e.detail.value,
                        change: true
                    })
                } else {
                    this.setData({
                        mobile:e.detail.value,
                    })
                }
                break
            case 'address':
                if(this.data.change === false) {
                    this.setData({
                        address:e.detail.value,
                        change: true
                    })
                } else {
                    this.setData({
                        address:e.detail.value,
                    })
                }
                break
        }
    },
    bindCheckChange: function () {
        this.setData({
            checked: this.data.checked === 0 ? 1 : 0,
            checkboxChange: !this.data.checkboxChange,
        })
    },
    bindProvinceChange: function(e) {
        if (parseInt(e.detail.value) === this.data.province_index) {
            return
        }
        this.setData({
            province_index: e.detail.value,
            province_region_id: this.data.province_region_ids[e.detail.value],
            city_index:0,
            district_index: 0,
            change: true
        })
        
        const cityPromise = new Promise((resolve, reject) => { 
            app.wxRequest({
                data: {
                    m:'region',
                    a:'address',
                    parent_id:this.data.province_region_ids[this.data.province_index]
                }, 
                success: (res) => {
                    let data = res.data.addressList
                    let names = []
                    let ids = []
                    data.map((d, i)=>{
                        names.push(d.name)
                        ids.push(d.id)
                    },this)
                    this.setData({
                        city_region_ids:ids,
                        city_region_names:names,
                        city_region_id:ids[0]
                    })
                    resolve({
                        city_region_ids:ids,
                        city_region_names:names,
                        city_index: 0
                    })
                },
                fail: (res) => {
                    reject(res)
                }
            })
        })

        cityPromise.then((data)=>{
            app.wxRequest({
                data: {
                    m:'region',
                    a:'address',
                    parent_id:data.city_region_ids[data.city_index]
                }, 
                success: (res) => {
                    let data = res.data.addressList
                    let names = []
                    let ids = []
                    data.map((d, i)=>{
                        names.push(d.name)
                        ids.push(d.id)
                    },this)
                    this.setData({
                        district_region_ids:ids,
                        district_region_names:names,
                        district_region_id: ids[0]
                    })
                }
            })
        })
    },
    bindCityChange: function(e) {
        if (parseInt(e.detail.value) === this.data.city_index) {
            return
        }
        this.setData({
            city_index: e.detail.value,
            city_region_id: this.data.city_region_ids[e.detail.value],
            district_index: 0,
            change: true
        })
            
        app.wxRequest({
           data: {
                m:'region',
                a:'address',
                parent_id:this.data.city_region_ids[this.data.city_index]
            }, 
            success: (res) => {
                let data = res.data.addressList
                let names = []
                let ids = []
                data.map((d, i)=>{
                    names.push(d.name)
                    ids.push(d.id)
                },this)
                this.setData({
                    district_region_ids:ids,
                    district_region_id:ids[0],
                    district_region_names:names
                })
            }
        })
    },
    bindDistrictChange: function(e) {
        if (parseInt(e.detail.value) === this.data.district_index) {
            return
        }
        this.setData({
            change: true,
            district_index: e.detail.value,
            district_region_id: this.data.district_region_ids[e.detail.value]
        })
    },
    onShow: function () {
        this.setData({...this.data,...wx.getStorageSync('address'),paying:false})
       
      
        // 默认省份
        const provinceRegionPromise = new Promise((resolve, reject) => {
            app.wxRequest({
                data: {
                    m:'region',
                    a:'address',
                    parent_id:1
                },
                success: (res) => {
                    let data = res.data.addressList
                    let names = []
                    let ids = []
                    data.map((d, i)=>{
                        names.push(d.name)
                        ids.push(d.id)
                        if(this.data.province_region_id !== '') {
                            this.data.province_region_id === d.id ? this.setData({
                                province_index: i
                            }) : null
                        }
                    },this)
                    this.setData({
                        province_region_ids:ids,
                        province_region_id:ids[this.data.province_index],
                        province_region_names:names
                    })
                    resolve({
                        province_region_ids:ids,
                        province_region_names:names,
                        province_index: this.data.province_index
                    })
                },
                fail: function (res) {
                    reject(res)
                }
            })
        })

        // 默认城市
        const cityRegionPromise = provinceRegionPromise.then((data) => {
            return new Promise((resolve, reject) => {
                app.wxRequest({
                    data: {
                        m:'region',
                        a:'address',
                        parent_id:data.province_region_ids[data.province_index]
                    },
                    success: (res) => {
                        let data = res.data.addressList
                        let names = []
                        let ids = []
                        data.map((d, i)=>{
                            names.push(d.name)
                            ids.push(d.id)
                            if(this.data.city_region_id !== '') {
                                this.data.city_region_id === d.id ? this.setData({
                                    city_index: i
                                }) : null
                            }
                        },this)
                        this.setData({
                            city_region_ids:ids,
                            city_region_id:ids[this.data.city_index],
                            city_region_names:names
                        })
                        resolve({
                            city_region_ids:ids,
                            city_region_names:names,
                            city_index: this.data.city_index
                        })
                    },
                    fail: function (res) {
                        reject(res)
                    }
                })
            }) 
        })

        // 默认区县
        cityRegionPromise.then((data) => {
            app.wxRequest({
                data: {
                    m:'region',
                    a:'address',
                    parent_id:data.city_region_ids[data.city_index]
                },
                success: (res) => {
                    let data = res.data.addressList
                    let names = []
                    let ids = []
                    data.map((d, i)=>{
                        names.push(d.name)
                        ids.push(d.id)
                        if(this.data.district_region_id !== '') {
                            this.data.district_region_id === d.id ? this.setData({
                                district_index: i
                            }) : null
                        }
                    },this)
                    this.setData({
                        district_region_ids:ids,
                        district_region_id:ids[this.data.district_index],
                        district_region_names:names
                    })
                },
                
            })
        }) 
    }
})
