// 时间格式化
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}


// 图片提取
const extractImg = str => {
    const checkImg = str => {
        const imgStart = '<img src="'
        const imgEnd = ['.jpg">', '.png">', '.gif">']
        if (str.indexOf(imgStart) > -1) {
            const sNum = str.indexOf(imgStart)

            let eNum = 0
            for (let value of imgEnd) {
                eNum = str.indexOf(value) + 6
                break
            }

            const imgLabel = str.substring(sNum, eNum)
            const imgSrc = imgLabel.substring(10, imgLabel.length - 2)
            imgTemp.push(imgSrc)

            const restStr = str.substring(eNum)
            checkImg(restStr)
        } else {
            return
        }
    }

    let imgTemp = []
    checkImg(str)
    return imgTemp
}

// 检测是否为数组
const isArray = arr => {
    return Object.prototype.toString.call(arr) == '[object Array]'
}

// 移除数组指定值项目
const removeArrItem = (arr, val) => {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
}

const arrContains = (arr, val) => {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            return true
        }
    }
    return false
}

module.exports = {
    formatTime: formatTime,
    extractImg: extractImg,
    isArray: isArray,
    removeArrItem: removeArrItem,
    arrContains: arrContains
}
