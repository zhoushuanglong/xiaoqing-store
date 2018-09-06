const app = getApp()

Page({
    data: {
        flag: false,
        shops: [{
            area: '深圳',
            shopList: [{
                name: '深圳宝安国际机场机器时代二号展示区',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516665529634723320.jpg',
                addr: '深圳市宝安国际机场T3候机楼安检内十字中心区',
            },{
                name: '深圳宝安国际机场机器时代一号智能体验馆体验店',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516665529634723320.jpg',
                addr: '深圳市宝安国际机场T3候机楼3C-04-09店铺',
            },{
                name: '风驰会展中心店',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516660890055169568.jpg',
                addr: '深圳市福田区会展中心地铁站A出口连城新天地二期地下商城岗会区间B08商铺',
                tel: '0755-83999396'
            },{
                name: '风驰海上世界店',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516660825406138155.jpg',
                addr: '深圳市南山区海上世界兴华路汇港购物中心1楼13号',
                tel: '0755-88277860'
            },{
                name: '购物公园连城店',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516660691115516249.jpg',
                addr: '深圳市南山区东滨路新一代国际公寓星宇数码广场一楼102B号',
            },{
                name: '南油东滨店',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516661102582409835.jpg',
                addr: '深圳市福田区购物公园地铁站B出口连城新天地A区A08商铺',
                tel: '0755-23943833'
            },{
                name: '南山苹果店',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516661049563020516.jpg',
                addr: '深圳市南山区东滨路新一代国际公寓星宇数码广场一楼102A号',
                tel: '0755-86191899'
            },{
                name: '南山保利店',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516661009528670696.jpg',
                addr: '深圳市南山区保利文化广场二楼B区14号'
            }]
        },{
            area: '杭州', 
            shopList: [{
                name: '杭州萧山国际机场机器时代一号智能体验馆',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516665984589679595.jpg',
                addr: '杭州萧山国际机场候机楼T1-B08店铺'
            }]
        },{
            area: '厦门', 
            shopList: [{
                name: '厦门高崎国际机场机器时代一号智能体验馆',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516666033211114778.jpg',
                addr: '厦门高崎国际机场T4航站楼T4-2-9店铺'
            }]
        },{
            area: '西安', 
            shopList: [{
                name: '西安咸阳国际机场机器时代智能体验馆',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516666089723506230.jpg',
                addr: '西安咸阳国际机场T3航站楼南过街楼3Sub1-4店铺'
            }]
        },{
            area: '郑州', 
            shopList: [{
                name: '郑州新郑国际机场机器时代智能体验馆',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516666143866813849.jpg',
                addr: '郑州新郑国际机场T2航站楼三层南中心商业区ELT-02'
            }]
        },{
            area: '浙江', 
            shopList: [{
                name: '极客未来浙江台州体验店',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516660971784811579.jpg',
                addr: '浙江省台州市临海市银泰城4楼极客未来体验店'
            },{
                name: '极客未来金华体验店',
                icon: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516660908602111136.jpg',
                addr: '浙江省金华市壶山广场A区1-118极客未来体验店'
            }]
        }]
    },
    call: function (e) {
        let { id } = e.currentTarget
        wx.makePhoneCall({
            phoneNumber: id
        })
    },
    onShow: function () {

    }
})