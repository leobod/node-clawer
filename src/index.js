const p = require('path');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const saveHtml = (content) => {
    fs.writeFile(p.join(process.cwd(), './test.html'), content, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('写入成功');
    });
}

const url = 'http://gh.aj52.com/databd.aspx?ssid=anNoYWpwamxiX2IyMDIzMTEyMTA3MTgwMF9iNTE=&page=1&sort=xuhao%20asc';

axios.get(url)
    .then(res => {
        console.log(res)
        // 如果请求成功且状态码为 200
        if (res.status == 200) {
            const body = res.data
            saveHtml(body)
            const $ = cheerio.load(body);

            const totalData = []

            // // 获取hotnews下全部的li元素
            // $('.hotnews').find('ul').find('li').each(function (index, value) {
            //     // 向数组中存放数据
            //     totalData.push({
            //         title: $(value).find('strong').find('a').text(),
            //         href: $(value).find('strong').find('a').attr('href')
            //     })
            // })

            // 打印结果
            console.log(totalData)
        }
    })
    .catch(e => {
        console.warn(e)
    })
