//index.js

import { extractImg, isArray } from '../../utils/util.js'
//获取应用实例
const app = getApp()

Page({
    data: {
        way: 'add',
        slectNum: 1,
        selectAmount: 0,
        key: 0,
        showModal: false,
        animationData: {},
        windowheight: app.globalData.windowheight,
        detailHeight: app.globalData.windowheight - app.currentPixel(100),
        heightDetail: 300, // introRule:swiper高度
        heightDetailImg: {}, // introRule:图片高度对象
        introActive: 0, // introRule:当前激活项
        imgIdArr: ['proIntro', 'proRule'], // introRule:图片id数组
        goodsDetail: {
            bannerImg: [], // 商品图片
            name: '',
            sample: '',
            price: '',
            intro: '',
            specification: ''
        },
        good_comment:[],
        paying: false,
        attr_num: 0,
        is_on_sale: 1,
        imgUrls: [{
            img_url: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516767174668406621.png',
            goods_id: app.globalData.goodsId,
            color: '#e1e1e1',
            desc: '冰雪白'
        },{
            img_url: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516767174441779088.png',
            goods_id: app.globalData.goodsId,
            color: '#c66471',
            desc: '熔岩红'
        },{
            img_url: 'https://wx.lanxiaoqing.com/data/gallery_album/3/original_img/1516767174552112161.png',
            goods_id: app.globalData.goodsId,
            color: '#639ed0',
            desc: '深海蓝'
        }],
        activeIndex: 0,
        isOverDeadLine: app.globalData.deadline - +new Date() < 0 ? true : false
    },
    previewImages: function (e) {
        let { id, dataset } = e.currentTarget
        wx.previewImage({
            current: id,
            urls: dataset.imgarr
        })
    },
    toComentList: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        wx.navigateTo({
            url: '../commentList/commentList'
        })
    },
    toCart: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        wx.reLaunch({
            url:'../cart/cart'
        })
    },
    toRetailshop: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        wx.navigateTo({
            url: '../retailshop/retailshop'
        })
    },
    imageLoad: function (event) {
        const imgheight = event.detail.height
        const imgWidth = event.detail.width

        const viewWidth = app.currentPixel(750)

        const realHeight = imgheight * viewWidth / imgWidth

        const imgObj = this.data.heightDetailImg

        imgObj[event.currentTarget.id] = realHeight
        this.setData({
            heightDetailImg: imgObj
        })
    },
    introTitleTap: function (e) {
        this.data.introActive !== e.currentTarget.id && this.setData({
            introActive: parseInt(e.currentTarget.id) 
        })
    },
    indexChange: function (e) {
        this.setData({
            activeIndex: e.detail.current
        })
    },
    introChange: function (e) {
        this.setData({
            introActive: e.detail.current
        })
    },
    selectModalShow: function (e) {
        let { id } = e.currentTarget
        this.animation.bottom(0).step()
        this.setData({
            way: id,
            showModal: true,
            animationData: this.animation.export()
        })
    },
    hideModal: function () {
        this.animation.bottom('-150%').step()
        this.setData({
            showModal: false,
            animationData: this.animation.export()
        })
    },
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
          // 来自页面内转发按钮
        }
        return {
          title: '小青商城',
          path: `/pages/detail/detail?goods_id=${app.globalData.goodsId}`,
          imageUrl: '../../img/cover.jpg',
          success: function(res) {
            wx.showToast({
                title: '已发送',
                icon: 'success',
                duration: 1000
            })
            wx.showShareMenu({
                // 要求小程序返回分享目标信息
                withShareTicket: true
            })
          },
          fail: function(res) {
            // 转发失败
            wx.showToast({
                title: '发送失败',
                icon: 'fail',
                duration: 1000
            })
          }
        }
    },
    selectColor: function (e) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let This = this
        let { specification, spekey } = this.data.goodsDetail
        let { id } = e.currentTarget
        if (this.data.key !== id) {
            app.wxRequest({
                data: {
                    m: 'goods',
                    a: 'price',
                    attr: specification[id].id,
                    goods_attr: spekey
                },
                success: function (res) {
                    This.setData({
                        attr_num: res.data.attr_number,
                        paying: false,
                        key: parseInt(id),
                        selectAmount: parseFloat(res.data.shop_price.split('¥')[1]).toFixed(2)
                    })
                },
                fail: () => {
                    This.setData({
                        paying: false
                    })
                }
            })
        }
    },
    count: function (e) {
        let { id } = e.currentTarget
        let { slectNum } = this.data
        switch (id) {
            case 'add':
                slectNum++
                break
            case 'remove':
                slectNum = slectNum > 1 ? slectNum - 1 : slectNum
                break
            case 'input':
                slectNum = parseInt(e.detail.value) < 1 ? slectNum : parseInt(e.detail.value)
                break
        }
        this.setData({
            slectNum
        })
    },
    addToCart: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let This = this
        let { way, slectNum, key, goodsDetail} = this.data
        let { specification, cartNum } = goodsDetail
        let temp = {
            number: slectNum,
            spec: [specification[key].id],
            goods_id: app.globalData.goodsId
        }
        let data = way === 'add' ? temp : {...temp,quick_order:1}
        app.wxRequest({
           data: {
                goods: {...data},
                m: 'cart',
                a: 'add_to_cart',
           },
           success: function (res) {
            if (res.statusCode === 200) {
                if (res.data.error === 3) {
                    wx.showModal({
                        title: '提示',
                        content: res.data.message[0] || '对不起，该商品已经下架'
                    })
                    This.animation.bottom(-app.currentPixel(800)).step()
                    This.setData({
                        is_on_sale: 0,
                        paying: false,
                        showModal: false,
                        animationData: This.animation.export()
                    })
                    return
                }
                goodsDetail.cartNum = cartNum + slectNum
                This.animation.bottom(-app.currentPixel(800)).step()
                This.setData({
                    paying: false,
                    goodsDetail,
                    showModal: false,
                    animationData: This.animation.export()
                },() => {
                    if (way !== 'add') {
                        wx.navigateTo({
                            url: '../paySettle/paySettle'
                        })
                    }
                })
                way === 'add' && wx.showToast({
                    title: '添加成功',
                    icon: 'success',
                    duration: 2000
                })
            }
           }
        })
    },
    submit: function (e) {
        this.addToCart()
    },
    onLoad:function (option) {
        if (option.goods_id){
            this.globalData.goodsId = option.goods_id
        }
    },
    onShow: function () {
        const This = this

        let animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
        })

        this.setData({
            paying: false
        })

        this.animation = animation

        const goodsPromise = new Promise(function (resolve, reject) {
            app.wxRequest({
                data: { m: 'goods' },
                success: function (res) {
                    const goodsData = res.data.data
                    const goodsInfo = goodsData.goods
                    const pictures = goodsData.pictures
                    const good_comment = goodsData.good_comment
                    let imgArr = []
                    let descArr = []
                    let arr = goodsInfo.desc_mobile.match(/<div class="section s-txt"><div class="txt">[0-9]{1,}<\/div>/g)
                    arr.map((d, i) => {
                        descArr.push(d.split('<div class="section s-txt"><div class="txt">')[1].split('</div>')[0])
                    })
                    // 展示图片 
                    for (let i in pictures) {
                        imgArr.push(app.globalData.hostUrl + pictures[i].img_url)
                    }

                    // 颜色默认索引，名称
                    let optdef, namedef, specification, spekey
                    for (let key in goodsData.specification) {
                        for (let keyin in goodsData.specification[key]) {
                            const speArr = goodsData.specification[key][keyin]
                            if (isArray(speArr)) {
                                spekey = key
                                speArr.map((value, key) => {
                                    if (goodsData.default_spe.split('、')[0] === value.label) {
                                        optdef = key
                                        namedef = value.label.split('-')[0]
                                    }
                                    speArr[key].color = value.label.split('-')[0].split('音箱')[1]
                                    speArr[key].img_url = `${app.globalData.hostUrl}/${value.img_flie}`
                                })
                                specification = speArr
                            }
                        }
                    }

                    // promise返回需要的数据
                    resolve({
                        goodsData: goodsData,
                        goodsInfo: goodsInfo,
                        proImg: extractImg(goodsInfo.desc_mobile),
                        imgArr: imgArr,
                        specification: specification,
                        spekey: spekey,
                        optdef: optdef,
                        namedef: namedef,
                        good_comment,
                        descArr
                    })
                },
                fail: function (res) {
                    reject(res)
                }
            })
        })

        const pricePromise = goodsPromise.then(function (data) {
            return new Promise(function (resolve, reject) {
                app.wxRequest({
                    data: {
                        m: 'goods',
                        a: 'price',
                        attr: data.specification[data.optdef].id,
                        goods_attr: data.spekey
                    },
                    success: function (res) {
                        resolve(Object.assign(data, {
                            attr_num: res.data.attr_number,
                            optdefinfo: res.data,
                            pricedef: res.data.shop_price.split('¥')[1]
                        }))
                    },
                    fail: function (res) {
                        reject(res)
                    }
                })
            })
        })

        pricePromise.then(function (data) {
            let { good_comment, goodsInfo, attr_num } = data
            let { goods_name, is_on_sale, marketPrice, goods_price } = goodsInfo
            if (good_comment[0]){
                let { user_picture, thumb, goods } = good_comment[0]
                let colors = []
                goods.map((d, i) => {
                    let temp = d.goods_attr.indexOf(':小青音响') > -1 ? d.goods_attr.split(':小青音响')[1].split('-')[0] : d.goods_attr.split(':')[1].split('音箱')[1].split('-')[0]
                    colors.push(temp)
                })
                colors = colors.join('、')
                thumb.map((d, i) => {
                    good_comment[0].thumb[i] = d.indexOf('http') > -1 || d.indexOf('https') > -1 ? d : app.globalData.hostUrl + d
                })
                good_comment[0].add_show_time = good_comment[0].add_time.split(' ')[0]
                good_comment[0].colors = colors
                good_comment[0].user_picture = good_comment[0].user_picture.indexOf('http') > -1 || good_comment[0].user_picture.indexOf('https') > -1 ? good_comment[0].user_picture : app.globalData.hostUrl + good_comment[0].user_picture
            }
            This.setData({
                goods_name,
                good_comment,
                is_on_sale: parseInt(is_on_sale),
                attr_num,
                attr_number: parseInt(goodsInfo.attr_number),
                selectAmount: data.pricedef,
                goods_price: parseFloat(goods_price).toFixed(2),
                marketPrice: parseFloat(marketPrice).toFixed(2),
                goodsDetail: {
                    bannerImg: data.imgArr, // 商品图片
                    name: data.namedef, // goodsInfo.goods_name
                    price: data.pricedef,
                    proImg: data.proImg,
                    sample: data.goodsInfo.goods_brief,
                    intro: data.goodsInfo.desc_mobile,
                    cartNum: data.goodsData.cart_number,
                    specification: data.specification,
                    spekey: data.spekey,
                    descArr: data.descArr
                }
            })
        })
    }
})
