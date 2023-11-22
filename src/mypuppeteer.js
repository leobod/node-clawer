const p = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { getVerifyCode } = require('./myocr')

const saveHtml = (content) => {
    fs.writeFile(p.join(process.cwd(), './test.html'), content, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('写入成功');
    });
}

const parseLogin = async (page) => {
    await new Promise(resolve => setTimeout(resolve, 2 * 1000));
    let content = await page.content();
    const $ = cheerio.load(content);
    const imgBase64 = $('.login-captcha img')[0].attribs.src
    const verifyCode = await getVerifyCode(imgBase64)
    console.log('verifyCode', verifyCode)
    await page.evaluate((code) => {
        const list = document.querySelectorAll('.el-input__inner')
        const inputEvent = new Event('input', {
            bubbles: true,  // 事件是否冒泡
            cancelable: true  // 事件是否可以取消
        });
        for (const item of list) {
            if (item.placeholder === '请输入账号') {
                item.value = 'sa'
                item.dispatchEvent(inputEvent)
            }
            if (item.placeholder === '请输入密码') {
                item.value = 'sa123456'
                item.dispatchEvent(inputEvent)
            }
            if (item.placeholder === '请输入验证码') {
                item.value = code
                item.dispatchEvent(inputEvent)
            }
        }
        const btn = document.querySelector('form .el-button')
        btn.click()
    }, verifyCode)
}

const isLogin = async (page) => {
    await new Promise(resolve => setTimeout(resolve, 3 * 1000));
    let content = await page.content();
    const $ = cheerio.load(content);
    const imgItem = $('.login-captcha img')
    if (imgItem && imgItem.length > 0) {
        return false
    } else {
        return true
    }
}

const changeImg = async (page) => {
    await page.evaluate(() => {
        const imgItem = document.querySelector('.login-captcha img')
        imgItem.click()
    })
}

const main = async () => {
    puppeteer.launch({ headless: false, defaultViewport: null }).then(async (browser) => {
        const page = await browser.newPage()


        await page.goto("http://localhost:3000/")

        await new Promise(resolve => setTimeout(resolve, 2 * 1000));

        // await page.evaluate(() => {
        //     let systemInfo = { "systemName": "会议系统测试", "systemIcon": "2023052516573473140728634.png" }
        //     let sysInfo = { "username": "sa", "tokenMeeting": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJc0FkbWluIjp0cnVlLCJVc2VyTmFtZSI6InNhIiwiTG9naW5Db2RlIjoic2EiLCJDdXN0Q29kZSI6ImRtcnMiLCJSb2xlQ29kZSI6IjAwMDEiLCJMb2dpbk5hbWUiOiLnrqHnkIblkZgiLCJDb21wYW55Q29kZSI6IiIsIm5iZiI6MTcwMDYzOTkyMCwiZXhwIjoxNzAwNjQ3MTIwLCJpc3MiOiJqd3RJc3N1ZXJVcGx1cyIsImF1ZCI6Imp3dEF1ZGllbmNlVXBsdXMifQ.cAcI6ruBBQ0QnsFqF7lfa2R7GKodnLtrdJtdMRhVnIQ", "isCollapse": false, "tokenType": "Bearer", "userAvater": "", "loginName": "管理员", "loginType": null, "custCode": "dmrs", "isAdmin": true, "uplodLimit": 2048, "isShowModifyPwdDialog": false, "isFirstLogin": false, "isOverdue": false }

        //     localStorage.setItem('langVisitor', 'zh')
        //     localStorage.setItem('systemInfo', JSON.stringify(systemInfo))
        //     localStorage.setItem('sysInfo', JSON.stringify(sysInfo))
        //     window.location = 'http://localhost:3000/'
        // })

        let times = 0
        let isLogined = await isLogin(page)
        while (times < 10 && !isLogined) {
            await parseLogin(page)
            isLogined = await isLogin(page)
            ++times
            if (!isLogined) {
                await changeImg(page)
            }
        }
        const cookies = await page.cookies("*");
        console.log(cookies);
    })
}


main()
