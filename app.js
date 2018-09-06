// app.js
const severHostUrl = 'https://wx.lanxiaoqing.com'
const serverApiUrl = severHostUrl + '/mobile/index.php'

App({
    // 用户登陆
    userLogin: function () {
        const This = this
        
        wx.login({
            success: function (res) {
                const code = res.code
                
                // 2.小程序调用wx.getUserInfo得到rawData, signatrue, encryptData
                wx.getUserInfo({
                    success: function (info) {
                        const rawData = info.rawData
                        const signature = info.signature
                        const encryptData = info.encryptData
                        const encryptedData = info.encryptedData //注意是encryptedData不是encryptData...坑啊
                        const iv = info.iv

                        //3.小程序调用server获取token接口, 传入code, rawData, signature, encryptData.
                        wx.request({
                            url: serverApiUrl,
                            data: {
                                m: "user",
                                c: "login",
                                a: "WxLogin",
                                code: code,
                                rawData: rawData,
                                signature: signature,
                                encryptData: encryptData,
                                iv: iv,
                                encryptedData: encryptedData
                            },
                            success: function (res) {
                                if (res.statusCode != 200) {
                                    wx.showModal({
                                        title: '登陆失败'
                                    })
                                } else {
                                    // wx.setStorageSync('session3rd', res.data.session3rd)
                                    This.globalData.launching ? This.globalData.launching = false : null
                                    This.globalData.loginSuccess = true
                                    This.globalData.userId = res.data.user_id
                                    This.globalData.session3rd = res.data.session3rd
                                    This.globalData.sessionId = res.data.session_id
                                    This.globalData.goodsId = res.data.goods_id
                                    This.globalData.rank = res.data.rank
                                }
                                typeof func == "function" && func(res.data);
                            },
                            fail: function (err) {
                                // console.log(err)
                            }
                        });
                    }
                })
            }
        })
    },
    
    onLaunch: function () {
        this.globalData.launching = true
        // 登陆
        this.userLogin()

        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况]
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })

        // 获取系统信息
        const This = this
        wx.getSystemInfo({
            success: function (res) {
                // 这里的高度单位为px，所有利用比例将100rpx转换为px
                This.globalData.pageHeight = res.windowHeight - res.windowWidth / 750 * 100
                This.globalData.windowheight = res.windowHeight
                This.globalData.windowWidth = res.windowWidth
            }
        })
    },

    onHide: function () {
        this.globalData.authorized = false
        this.globalData.getCou = false
    },

    onShow: function () {
        if (!this.globalData.authorized)
            wx.getSetting({
                success: res => {
                    if (!res.authSetting['scope.userInfo']) {
                        wx.openSetting({
                            success: (res) => {
                            /*
                            * res.authSetting = {
                            *   "scope.userInfo": true,
                            *   "scope.userLocation": true
                            * }
                            */
                                this.globalData.authorized = true
                                this.globalData.userLogin = true
                                this.userLogin()
                            }
                        })
                    }
                }
            })
        let This = this
        
        wx.checkSession({
            success: function () {
                // session 未过期，并且在本生命周期一直有效
                // console.log('登陆未过期')
            },
            fail: function () {
                // 登陆态过期重新登陆
                This.userLogin()
            }
        })
    },

    // 计算当前屏幕像素值
    currentPixel: function (pixel) {
        return this.globalData.windowWidth / 750 * pixel
    },

    // 登陆之后再进行其它reques请求封装方法
    wxRequest: function (obj) {
        const This = this
        if (this.globalData.loginSuccess) {
            this.appRequest(obj)
        } else {
            wx.showLoading({
                title: '登录中',
            })

            this.userLogin()

            const loginTimer = setInterval(function () {
                if (This.globalData.loginSuccess) {
                    clearInterval(loginTimer)
                    wx.hideLoading()
                    This.appRequest(obj)
                }
            }, 1000)
        }
    },

    appRequest: function (obj) {
        obj.showLoading && wx.showLoading({
            title: '加载中',
        })
        const dataParam = !obj.data.noid ? {
            id: this.globalData.goodsId,
            u: this.globalData.userId,
            session3rd: this.globalData.session3rd
        } : {
            u: this.globalData.userId,
            session3rd: this.globalData.session3rd
        }
        
        const headerParam = { 'Cookie': 'ECS_ID=' + this.globalData.sessionId }
        wx.request({
            url: obj.url ? (this.globalData.hostUrl + obj.url) : this.globalData.apiUrl,
            data: obj.data ? Object.assign({},dataParam, obj.data) : dataParam,
            header: obj.header ? headerParam : Object.assign(headerParam, obj.header),
            method: obj.method ? obj.method : 'GET',
            dataType: obj.dataType ? obj.dataType : 'json',
            success: function (res) {
                obj.showLoading && wx.hideLoading()
                if (obj.success) {
                    obj.success(res)
                }
            },
            fail: function (res) {
                if (obj.fail) {
                    obj.fail(res)
                }
            },
            complete: function (res) {
                if (obj.complete) {
                    obj.complete(res)
                }
            },
        })
    },

    // 全局变量
    globalData: {
        userInfo: null,
        launching: false,

        apiUrl: serverApiUrl,
        hostUrl: severHostUrl,

        loginSuccess: false,
        sessionId: 0,
        session3rd: 0,
        userId: 0,
        goodsId: 0,

        pageHeight: 0,
        windowheight: 0,
        windowWidth: 0,
        rank: '0',
        authorized: false,
        getCou: false,

        phoneNumber: '075586717585',
        deadline: +new Date(2018, 2, 31, 0, 0, 0)
    }
})