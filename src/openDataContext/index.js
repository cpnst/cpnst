function drawRankList(data) {
    let sharedCanvas = wx.getSharedCanvas()
    let ctx = sharedCanvas.getContext('2d')
    // context.fillStyle = 'red'
    // ctx.fillStyle="#0000ff";
    // ctx.fillRect(0, 0, 1000, 1000)
    // // ctx.fillStyle="#0000ff";
    // ctx.fillRect(0,0,sharedCanvas.width,sharedCanvas.height);
    let numY = 40
    let ratio = 74
    data.forEach((item, index) => {
        if (parseInt(index) + 1 <= 15) {
            ctx.font="36px Georgia";
            ctx.fillStyle = 'white';
            //排名
            ctx.fillText(index + 1, 0, numY + ratio  * index, 30);
            // 头像
            let img = wx.createImage()
            img.src = item.avatarUrl
            img.onload=function() {
                ctx.drawImage(img, 40, 74 * index, 56, 56);
            }
            
            // 昵称
            ctx.fillText(item.nickname.substring(0,8), 115, numY + ratio  * index, 200);
            // 成绩
            if(item.KVDataList.length === 0) {
                ctx.fillText("0", 500, numY + ratio  * index, 250);
            }else{
                let score = item.KVDataList[0].value;
                ctx.fillText(score.replace(/\b(0+)/gi,""), 500, numY + ratio  * index, 250);
            }
        }
    })
}

wx.onMessage(data => {
    let keyList = ["score"]
    if(data.type === 'setScore')  {
        // 设置排名
        wx.getUserCloudStorage({
            keyList: keyList,
            success: res => {
                let scoreResult = data.score
                if(res.KVDataList.length !== 0) {
                    let result = res.KVDataList[0].value
                    if(parseInt(result) < parseInt(data.score)) {
                        // 新最终成绩，存储进微信提供的数据库
                        let kvdata = new Array();
                        kvdata.push({
                            key: "score",
                            value: scoreResult + ""
                        });
                        wx.setUserCloudStorage({
                            KVDataList: kvdata,
                            success: (msg) => {console.log('success', msg)},
                            fail: (msg) => {console.log('fail', msg)},
                        })
                    }
                }else{
                    // 新最终成绩，存储进微信提供的数据库
                    let kvdata = new Array();
                    kvdata.push({
                        key: "score",
                        value: scoreResult + ""
                    });
                    wx.setUserCloudStorage({
                        KVDataList: kvdata,
                        success: (msg) => {console.log('success', msg)},
                        fail: (msg) => {console.log('fail', msg)},
                    })
                }
            },
            fail: res => {
                console.log(res)
            }
        })
    }else{
        // 排行榜
        wx.getFriendCloudStorage({
            keyList: keyList,
            success: function (res) {
                let r = res.data.sort(function(param1, param2) {
                    return parseInt(param2.KVDataList[0].value) -
                        parseInt(param1.KVDataList[0].value)
                })
                // 根据成绩排名
                drawRankList(r)
            }
        });
    }
})