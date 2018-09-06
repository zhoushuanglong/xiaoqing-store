//addressManage.js
//获取应用实例
const app = getApp()

Page({
    data: {
       address_list: [],
       selected_id:null,
       defalut_id: null,
       paying: false
    },
    bindselect: function (e) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let {id, dataset} = e.currentTarget
        let { consignee, mobile, address } = dataset.address
        let {address_list} = this.data
        let temp = [address_list[dataset.index]]
        address_list.splice(dataset.index,1)
        address_list = [...temp,...address_list]
        this.setData({
           selected_id: id,
           address_list
        })


        wx.setStorageSync('selectedAddress',{address_id:id,address:`${consignee} ${mobile} ${address.replace(' ','')}`})
        wx.navigateBack({url:'../paySettle/paySettle'})
    },
    toeditAddress: function (e) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let This = this
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
        wx.setStorageSync('address',{...addressInfo,flag: This.data.defalut_id === addressInfo.address_id ? false : true })
        wx.navigateTo({
            url:'../addressEdit/addressEdit'
        })
    },

    toNewAddress: function (e) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        wx.setStorageSync('address',{flag:this.data.address_list.length === 0 ? false : true, checked: this.data.address_list.length === 0 ? 1 : 0})
        wx.setStorageSync('url','../addressList/addressList')
        wx.navigateTo({
            url:'../addressEdit/addressEdit'
        })
    },

    onShow: function () {
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
                data.data !== '' && data.consignee_list.map((d, i) => {
                    d.mobileStr = d.mobile.replace(d.mobile.slice(3,7),'****')
                    if (d.address_id === wx.getStorageSync('selectedAddress').address_id){
                        this.setData({
                            selected_id: wx.getStorageSync('selectedAddress').address_id
                        })
                        let temp = [data.consignee_list[i]]
                        data.consignee_list.splice(i, 1)
                        data.consignee_list = [...temp,...data.consignee_list]
                    }
                })
                
                this.setData({
                    address_list: data.consignee_list || [],
                    defalut_id: data.defulte_id
                })
            }
        })
    }
})
