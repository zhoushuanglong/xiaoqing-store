import { removeArrItem, arrContains } from '../../utils/util.js'

const app = getApp()
Page({
    data: {
        pageHeight: wx.getSystemInfoSync().windowHeight - app.currentPixel(200),
        selectImg: '../../img/select-default.jpg',
        selectedImg: '../../img/select-default-active.jpg',
        delBtnWidth: app.currentPixel(100),

        startX: 0,
        goodsAllPrice: 0,
        cartShow: 0,

        goodsList: null,
        selectedArr: [],
        selectAll: true,
        itemAll: 0,

        paying: false
    },
    onShow: function () {
        const This = this
        wx.getStorageSync('goodsId') && wx.removeStorageSync('goodsId')
        wx.getStorageSync('url') && wx.removeStorageSync('url')
        wx.getStorageSync('specification') && wx.removeStorageSync('specification')
        wx.getStorageSync('address') && wx.removeStorageSync('address')
        this.setData({
            paying: false
        })
        const cartPromise = new Promise(function (resolve, reject) {
            app.wxRequest({
                data: {
                    m: 'cart'
                },
                success: function (res) {
                    if (res.statusCode === 200) {
                        resolve(res.data.data)
                    }
                },
                fail: function (res) {
                    reject(res)
                }
            })
        })

        cartPromise.then(function (data) {
            let lists = data.cart_goods.goods_list
            let goodsAllPrice = 0

            let itemNum = 0, selectedArr = [], selectAll = true, cartShow = 0
            for (let i in lists) {
                for (let m in lists[i].goods_list) {
                    const item = lists[i].goods_list[m]

                    itemNum++
                    if (parseInt(item.is_checked) === 1) {
                        cartShow += parseInt(item.goods_number)
                        selectedArr.push(item.rec_id)
                        goodsAllPrice += parseFloat(item.goods_amount)
                    }

                    lists[i].goods_list[m].swipePixel = 0
                    lists[i].goods_list[m].goods_attr = item.goods_attr.split('-')[0]
                    lists[i].goods_list[m].goods_price = item.goods_price.split('¥')[1]
                    lists[i].goods_list[m].goods_thumb = item.attr_thumb ? (item.attr_thumb.indexOf('/') === 0 ? app.globalData.hostUrl + item.attr_thumb : `${app.globalData.hostUrl}/${item.attr_thumb}`) : `${app.globalData.hostUrl}${item.goods_thumb}` 
                }
            }

            if (itemNum === selectedArr.length) {
                selectAll = true
            } else {
                selectAll = false
            }

            let totals = data.cart_goods.total
            totals.goods_price = totals.goods_price.split('¥')[1]

            This.setData({
                goodsAllPrice: goodsAllPrice.toFixed(2),
                cartShow,
                goodsList: lists || [],
                selectedArr: selectedArr,
                itemAll: itemNum,
                selectAll: selectAll
            })
        })

    },

    selectSingleGoods: function (event) {
        let This = this
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        const index = event.target.dataset.index.split('-')
        const lists = this.data.goodsList

        const cur = lists[index[0]].goods_list[index[1]]
        let status = '0',
            arrTemp = this.data.selectedArr,
            selectAll = false,
            cartNum = 0,
            allPrice = 0

        if (parseInt(cur.is_checked) === 1) {
            status = '0'
            cartNum = parseInt(this.data.cartShow) - parseInt(cur.goods_number)
            removeArrItem(arrTemp, cur.rec_id)
            selectAll = false
            allPrice = (this.data.goodsAllPrice - parseFloat(cur.goods_price) * parseFloat(cur.goods_number)).toFixed(2)
        } else {
            status = '1'
            cartNum = parseInt(this.data.cartShow) + parseInt(cur.goods_number)
            arrTemp.push(cur.rec_id)
            allPrice = (parseFloat(this.data.goodsAllPrice) + parseFloat(cur.goods_price) * parseFloat(cur.goods_number)).toFixed(2)
            if (this.data.itemAll === arrTemp.length) {
                selectAll = true
            } else {
                selectAll = false
            }
        }
        lists[index[0]].goods_list[index[1]].is_checked = status

        app.wxRequest({
            data: {
                m: 'cart',
                a: 'checked_cart',
                cart_value: cur.rec_id,
                is_checked: cur.is_checked
            },
            success: (res) => {
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

        this.setData({
            goodsAllPrice: allPrice,
            cartShow: cartNum,
            goodsList: lists ,
            selectedArr: arrTemp,
            selectAll: selectAll
        })
    },

    selectAllGoods: function (event) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let This = this
        let loop = [], arrTemp = [], selectAll = [], cartNum = 0, allPrice = 0, arr=[]
        if (this.data.selectAll) {
            loop = this.loopList(function (item) {
                item.is_checked = '0'
                arr.push(item.rec_id)
            }, 'obj')
            arrTemp = []
            cartNum = 0
            selectAll = false
            allPrice = 0.00
            app.wxRequest({
                data: {
                    m: 'cart',
                    a: 'checked_cart',
                    cart_value: arr.join(','),
                    is_checked: 0
                },
                success: (res) => {
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
        } else {
            loop = this.loopList(function (item, obj) {
                item.is_checked = '1'

                let arrTempIn = obj.arrTemp
                arrTempIn.push(item.rec_id)
                obj.arrTemp = arrTempIn

                obj.cartNum = obj.cartNum + parseInt(item.goods_number)

                obj.allPrice = obj.allPrice + parseInt(item.goods_number) * parseFloat(item.goods_price)
            }, { arrTemp: arrTemp, cartNum: cartNum, allPrice: allPrice })

            arrTemp = loop.obj.arrTemp
            cartNum = loop.obj.cartNum
            allPrice = loop.obj.allPrice
            selectAll = true

            app.wxRequest({
                data: {
                    m: 'cart',
                    a: 'checked_cart',
                    cart_value: arrTemp.join(','),
                    is_checked: 1
                },
                success: (res) => {
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
        }

        this.setData({
            goodsAllPrice: allPrice.toFixed(2),
            goodsList: loop.lists,
            selectedArr: arrTemp,
            cartShow: cartNum,
            selectAll: selectAll
        })
    },

    loopList: function (fn, obj) {
        const lists = this.data.goodsList
        let objClone = obj
        for (let i in lists) {
            for (let m in lists[i].goods_list) {
                const item = lists[i].goods_list[m]
                fn(item, objClone)
            }
        }

        if (obj) {
            return {
                lists: lists,
                obj: objClone
            }
        } else {
            return {
                lists: lists
            }
        }
    },

    goodsChange: function (event) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        const This = this
        const index = event.target.dataset.index.split('-')
        const lists = this.data.goodsList

        const cur = lists[index[0]].goods_list[index[1]]

        let num = 1, numAll = parseInt(this.data.cartShow), curNum = parseInt(cur.goods_number), allPrice = this.data.goodsAllPrice
        if (curNum >= 0) {
            switch (event.target.dataset.type) {
                case 'subtract':
                    if (curNum > 1) {
                        num = curNum - 1
                        if (arrContains(This.data.selectedArr, cur.rec_id)){
                            allPrice = (parseFloat(this.data.goodsAllPrice) - parseFloat(cur.goods_price)).toFixed(2)
                            numAll--
                        }
                    } else {
                        this.setData({
                            paying: false
                        })
                        return
                    }
                    break;
                case 'add':
                    num = curNum + 1
                    if (arrContains(This.data.selectedArr, cur.rec_id)){
                        allPrice = (parseFloat(this.data.goodsAllPrice) + parseFloat(cur.goods_price)).toFixed(2)
                        numAll++
                    }
                    break;
                case 'input':
                    num = event.detail.value === '' || parseInt(event.detail.value) < 1  ? curNum : parseInt(event.detail.value)
                    if (arrContains(This.data.selectedArr, cur.rec_id)){
                        allPrice = (parseFloat(this.data.goodsAllPrice) + (num - curNum) * parseFloat(cur.goods_price)).toFixed(2)
                        numAll += num - curNum
                    }
            }
            lists[index[0]].goods_list[index[1]].goods_number = num
            app.wxRequest({
                data: {
                    m: 'cart',
                    a: 'cart_goods_number',
                    number: num,
                    id: cur.rec_id,
                    arr: This.data.selectedArr.join(',')
                },
                success: function (res) {
                    lists[index[0]].goods_list[index[1]].goods_number = res.data.num
                    if (res.data.num !== num) {
                        allPrice = parseFloat(allPrice - (num - res.data.num) * cur.goods_price).toFixed(2)
                        numAll -= (num - res.data.num)
                    }
                    This.setData({
                        goodsAllPrice: allPrice,
                        goodsList: lists,
                        cartShow: numAll,
                        paying: false
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

    touchS: function (event) {
        if (event.touches.length == 1) {
            this.setData({
                startX: event.touches[0].clientX
            });
        }
    },

    touchM: function (event) {
        if (event.touches.length == 1) {
            const index = event.currentTarget.id.split('-')
            const lists = this.data.goodsList
            const cur = lists[index[0]].goods_list[index[1]]

            const moveX = event.touches[0].clientX
            const disX = this.data.startX - moveX
            const delBtnWidth = this.data.delBtnWidth
            let swipePixel = 0
            if (Math.abs(cur.swipePixel) !== delBtnWidth) {
                if ( disX >= 0) {
                    swipePixel = -disX  
                    if (disX <= delBtnWidth) {
                        //获取手指触摸的是哪一项
                        lists[index[0]].goods_list[index[1]].swipePixel = swipePixel
                        //更新列表的状态
                        this.setData({
                            goodsList: lists
                        })
                    }
                }
            }

           
        }
    },

    touchE: function (event) {
        if (event.changedTouches.length == 1) {
            const endX = event.changedTouches[0].clientX
            const disX = this.data.startX - endX
            const delBtnWidth = this.data.delBtnWidth
            let swipePixel = 0
            if (disX > delBtnWidth / 2) {
                swipePixel = -delBtnWidth
            } else {
                swipePixel = 0
            }

            //获取手指触摸的是哪一项
            const index = event.currentTarget.id.split('-')
            const lists = this.data.goodsList
            const cur = lists[index[0]].goods_list[index[1]]
            lists[index[0]].goods_list[index[1]].swipePixel = swipePixel
            //更新列表的状态
            this.setData({
                goodsList: lists
            })
        }
    },
    delItem: function (event) {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        const This = this
        const index = event.target.dataset.index.split('-')
        const lists = this.data.goodsList
        const cur = lists[index[0]].goods_list[index[1]]

        let allPrice = this.data.goodsAllPrice,
            cartShow = this.data.cartShow,
            selectedArr = this.data.selectedArr,
            selectAll = this.data.selectAll,
            itemAll = this.data.itemAll

        if (parseInt(cur.is_checked) === 1) {
            allPrice = (allPrice - parseInt(cur.goods_number) * parseFloat(cur.goods_price)).toFixed(2)
            cartShow -= parseInt(cur.goods_number)
            removeArrItem(selectedArr, cur.rec_id)
        } else {
            if (selectAll === false) {
                const loop = this.loopList(function (item, obj) {
                    if (item.rec_id != cur.rec_id) {
                        obj.all = obj.all++
                        if (parseInt(item.is_checked) === 1) {
                            obj.selected = obj.selected++
                        }
                    }
                }, { all: 0, selected: 0 })
                if (loop.obj.all === loop.obj.selected) {
                    selectAll = true
                }
            }
        }

        itemAll -= 1
        lists[index[0]].goods_list.splice(index[1], 1)

        app.wxRequest({
            data: {
                m: 'cart',
                a: 'delete_cart',
                id: cur.rec_id
            },
            success: function (res) {
                if (res.data.error === 0) {
                    This.setData({
                        goodsAllPrice: allPrice,
                        cartShow: cartShow,
                        goodsList: lists,
                        selectedArr: selectedArr,
                        selectAll: selectAll,
                        itemAll: itemAll,
                        paying: false
                    })

                    wx.showToast({
                        title: '删除成功',
                        icon: 'success',
                        duration: 2000
                    })
                } else {
                    wx.showToast({
                        title: '删除失败',
                        icon: 'warn',
                        duration: 2000
                    })
                    This.setData({
                        paying: false
                    })
                }
            },
            fail: () => {
                This.setData({
                    paying: false
                })
            }
        })

    },
    goodsPay: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let This = this
        if (this.data.selectedArr.length === 0 || parseFloat(this.data.goodsAllPrice) === 0) {
            wx.showModal({
                title: '提示',
                content:parseFloat(this.data.goodsAllPrice) === 0 ? '商品数量不能为0' : '您还未选择任何商品',
                showCancel:false
            }) 
            this.setData({
                paying: false
            })
            return
        }
        wx.setStorageSync('goodsId',this.data.selectedArr)
        wx.navigateTo({
            url:'../paySettle/paySettle'
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
    }
})
