const app = getApp()

Page({
    data: {
        imgArr: [],
        goods_info:{},
        comment: '',
        urls: [],
        colorArr: [],
        paying: false
    },
    selectImg: function () {
        wx.chooseImage({
            count: 4 - this.data.imgArr.length,
            success: (res) => {
                let { tempFilePaths, tempFiles } = res
                this.setData({
                    imgArr: [...this.data.imgArr,...tempFilePaths]
                })
            }
        })
    }, 
    removeImg: function (e) {
        let { imgArr } = this.data
        imgArr.splice(e.currentTarget.id,1)
        this.setData({
            imgArr
        })
    },
    previewImages: function (e) {
        wx.previewImage({
            current: this.data.imgArr[e.currentTarget.id],
            urls: this.data.imgArr
        })
    },
    onblur: function (e) {
        this.setData({
            comment: e.detail.value
        })
    },
    bindSubmit: function () {
        if (this.data.paying) {
            return
        }
        this.setData({
            paying: true
        })
        let This = this
        let { comment, imgArr, urls, goods_info  } = this.data
        if (comment === '') {
            wx.showModal({
                title: '提示',
                content: '您还未添加任何评论',
                showCancel: false
            })
            this.setData({
                paying: false
            })
            return
        }
        if (imgArr.length > 0) {
            let promiseArr = []
            wx.showLoading({
                title: '上传图片中...'
            })

            imgArr.map((d, i) => {
                if (i === 0) {
                    promiseArr[0] = new Promise((resolve, reject) => {
                        var key = Math.random().toString(36).substr(2)
                        wx.uploadFile({
                            url: app.globalData.hostUrl + '/mobile/user/index/upload',
                            filePath: d,
                            name: 'file',
                            header:{
                                'content-type':'multipart/form-data'
                            },
                            formData: {
                                'key': key//这里是为文件设置上传后的文件名  
                            },
                            success: (res) => {
                                let data = JSON.parse(res.data)
                                if (data.error === 0) {
                                    resolve([data.url.file.url])
                                } else {
                                    This.setData({
                                        paying: false
                                    })
                                    wx.hideLoading()
                                    setTimeout(() => {
                                        wx.showToast({
                                            title: '上传图片失败',
                                            image: '../../img/close.png'
                                        })
                                        setTimeout(() => {
                                            wx.hideToast()
                                        }, 2000)
                                    }, 500);
                                    reject('error')
                                }
                            },
                            fail: (res)=> {
                                This.setData({
                                    paying: false
                                })
                                wx.hideLoading()
                                setTimeout(() => {
                                    wx.showToast({
                                        title: '上传图片失败',
                                        image: '../../img/close.png'
                                    })
                                    setTimeout(() => {
                                        wx.hideToast()
                                    }, 2000)
                                }, 500);
                                reject(res)
                            }
                        })
                    })
                    if (i === imgArr.length - 1) {
                        promiseArr[i].then((urls) => {
                            app.wxRequest({
                                data: {
                                    m: 'user',
                                    a: 'AddComment',
                                    content: comment,
                                    order_id: goods_info.order_id,
                                    files_url: urls.join(',')
                                },
                                success: (res) => {
                                    if (res.data.error === 0){
                                        wx.hideLoading()
                                        setTimeout(() => {
                                            wx.showToast({
                                                title: '评论成功',
                                                icon: 'success',
                                            })
    
                                            setTimeout(() => {
                                                wx.reLaunch({
                                                    url: '../index/index',
                                                    success: () => {
                                                        wx.navigateTo({
                                                            url: '../detail/detail'
                                                        })
                                                    }
                                                })
                                            },2000)
                                        }, 500);
                                        
                                    } else {
                                        This.setData({
                                            paying: false
                                        })
                                        wx.hideLoading()
                                        setTimeout(() => {
                                            wx.showToast({
                                                title: '上传图片失败',
                                                image: '../../img/close.png'
                                            })
                                            setTimeout(() => {
                                                wx.hideToast()
                                            }, 2000)
                                        }, 500);
                                    }
                                },
                                fail: () => {
                                    This.setData({
                                        paying: false
                                    })
                                    wx.hideLoading()
                                    wsetTimeout(() => {
                                        wx.showToast({
                                            title: '评论失败',
                                            image: '../../img/close.png'
                                        })
                                        setTimeout(() => {
                                            wx.hideToast()
                                        }, 2000)
                                    }, 500);
                                }
                            })
                        })
                    }
                } else {
                    promiseArr[i] = promiseArr[i - 1].then((urls) => {
                        return new Promise((resolve, reject) => {
                            var key = Math.random().toString(36).substr(2)
                            wx.uploadFile({
                                url: app.globalData.hostUrl + '/mobile/user/index/upload',
                                filePath: d,
                                name: 'file',
                                header:{
                                    'content-type':'multipart/form-data'
                                },
                                formData: {
                                    'key': key//这里是为文件设置上传后的文件名  
                                },
                                success: (res) => {
                                    let data = JSON.parse(res.data)
                                    if (data.error === 0) {
                                        resolve([...urls,data.url.file.url])
                                    } else {
                                        This.setData({
                                            paying: false
                                        })
                                        wx.hideLoading()
                                        setTimeout(() => {
                                            wx.showToast({
                                                title: '上传图片失败',
                                                image: '../../img/close.png'
                                            })
                                            setTimeout(() => {
                                                wx.hideToast()
                                            }, 2000)
                                        }, 500);
                                        reject('error')
                                    }
                                },
                                fail: (res)=> {
                                    This.setData({
                                        paying: false
                                    })
                                    wx.hideLoading()
                                    setTimeout(() => {
                                        wx.showToast({
                                            title: '上传图片失败',
                                            image: '../../img/close.png'
                                        })
                                        setTimeout(() => {
                                            wx.hideToast()
                                        }, 2000)
                                    }, 500);
                                    reject(res)
                                }
                            })
                        })
                    })
                    if (i === imgArr.length - 1) {
                        promiseArr[i].then((urls) => {
                            app.wxRequest({
                                data: {
                                    m: 'user',
                                    a: 'AddComment',
                                    content: comment,
                                    order_id: goods_info.order_id,
                                    files_url: urls.join(',')
                                },
                                success: (res) => {
                                    if (res.data.error === 0){
                                        wx.hideLoading()
                                        setTimeout(() => {
                                            wx.showToast({
                                                title: '评论成功',
                                                icon: 'success',
                                            })
    
                                            setTimeout(() => {
                                                wx.reLaunch({
                                                    url: '../index/index',
                                                    success: () => {
                                                        wx.navigateTo({
                                                            url: '../detail/detail'
                                                        })
                                                    }
                                                })
                                            },2000)
                                        }, 500);
                                        
                                    } else {
                                        This.setData({
                                            paying: false
                                        })
                                        wx.hideLoading()
                                        setTimeout(() => {
                                            wx.showToast({
                                                title: '上传图片失败',
                                                image: '../../img/close.png'
                                            })
                                            setTimeout(() => {
                                                wx.hideToast()
                                            }, 2000)
                                        }, 500);
                                    }
                                },
                                fail: () => {
                                    This.setData({
                                        paying: false
                                    })
                                    wx.hideLoading()
                                    setTimeout(() => {
                                        wx.showToast({
                                            title: '上传图片失败',
                                            image: '../../img/close.png'
                                        })
                                        setTimeout(() => {
                                            wx.hideToast()
                                        }, 2000)
                                    }, 500);
                                }
                            })
                        })
                    }
                }
            })
        } else {
            app.wxRequest({
                data: {
                    m: 'user',
                    a: 'AddComment',
                    content: comment,
                    order_id: goods_info.order_id
                },
                success: (res) => {
                    if (res.data.error === 0) {
                        wx.showToast({
                            title: '评论成功',
                            icon: 'success',
                            duration: 2000
                        })
    
                        setTimeout(() => {
                            wx.hideToast()
                            wx.reLaunch({
                                url: '../index/index',
                                success: () => {
                                    wx.navigateTo({
                                        url: '../detail/detail'
                                    })
                                }
                            })
                        },2000)
                    } else {
                        This.setData({
                            paying: false
                        })
                        wx.showToast({
                            title: '评论失败',
                            image: '../../img/close.png'
                        })
                        setTimeout(() => {
                            wx.hideToast()
                        }, 2000)
                    }
                    
                },
                fail: () => {
                    This.setData({
                        paying: false
                    })
                    wx.showToast({
                        title: '评论失败',
                        image: '../../img/close.png'
                    })
                    setTimeout(() => {
                        wx.hideToast()
                    }, 2000)
                }
            })
        }
    },
    onShow: function () {
        this.setData({
            paying: false
        })
    },
    onLoad: function () {
        let goods_info = wx.getStorageSync('goods_info')
        this.setData({
            goods_info
        }) 
        wx.removeStorageSync('goods_info')
    }
})