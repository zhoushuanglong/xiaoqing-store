const app = getApp()

Page({
    data: {
        total: 1,
        currentPage: 1,
        coupons: []
    },
    useCoupon: function () {
        wx.reLaunch({
            url: '../index/index',
            success: () => {
                wx.navigateTo({
                    url: '../detail/detail'
                })
            }
        })
    },
    getCoupons: function (page) {
        let This = this
        app.wxRequest({
            data: {
                m: 'coupont',
                a: 'coups'
            },
            success: (res) => {
                let { totalPage, coupons_list } = res.data
                let coupons = []
                let overdue = []
                let used = []
                for (const key in coupons_list) {
                    coupons_list[key].isOverdue = new Date(coupons_list[key].endtime.replace(' ','T')).getTime() - new Date().getTime() < 0 ? true : false
                   
                    if (coupons_list[key].is_use === '0' && !coupons_list[key].isOverdue) {
                        coupons.push(coupons_list[key])
                    } else if (coupons_list[key].is_use === '1') {
                        used.push(coupons_list[key])
                    } else {
                        overdue.push(coupons_list[key])
                    }
                }
                
                This.setData({
                    coupons: [...coupons,...used,...overdue],
                    total: totalPage,
                    currentPage: page
                })
            }
        })
    },
    onLoad: function () {
        this.getCoupons()
    }
})