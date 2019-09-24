// ==UserScript==
// @name         抓取2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  根据网页链接获取HTML文本，并从中提取所需信息
// @author       You
// @include      https://gt4.topease.net/*
// @grant        none
// @run-at       context-menu
// ==/UserScript==

(function() {
    'use strict';
    //供应商信息
    var allInfo = [];

    ////获取公司名及链接

    //获取想要循环的次数
    var wanted = prompt('单次循环抓取2页，请输入总循环次数：');
    //总页数
    var totalPage = 2;
    //控制单轮循环页数
    var flag = 0;
    //控制xmlhttprequest访问
    var flag1 = 0;
    //控制总循环的次数
    var flag2 = 0;
    //存放要抓取的所有供应商链接
    var urlInfo = [];
    //
    var message = [];
    //获取当前页面的公司名及链接
    function getUrl(){
        jQuery(document).ready(function(){
            var tr = jQuery("tbody tr");
            tr.each(function(index){
                let td = jQuery(this).find("td").eq(3);
                //存储单个公司名及链接
                let msg = [];
                let name = td.text();
                let href = td.find("a").attr("href");
                if(name){
                    let j = true;
                    for(let i = 0 ; i < urlInfo.length; i++){
                        if(name==urlInfo[i][0]){
                            j = false;
                        }
                    }
                    if(j){
                        msg.push(name);
                        msg.push(href);
                        urlInfo.push(msg);
                    }
                }
            });
        });
    }
    //下一页
    function nextPage(){
        jQuery(".pagination li[class = 'active'] + li").find("a").click();
    }

    function interval(){
        new Promise(function(resolve) {
            getUrl();
            resolve();
        });
        nextPage();
        flag++;
        if(flag == totalPage){
            clearInterval(get);
            setTimeout(function(){
                console.log(urlInfo);
                eachUrl();
            });
        }
    }
    //定时循环
    var get = setInterval(interval,2000);


    //遍历url，并访问
    function eachUrl(){
        setTimeout(function(){
            if(urlInfo.length > flag1){
                let msg = urlInfo[flag1];
                flag1++;
                let url = "https://gt4.topease.net" + msg[1];
                var xmlHttpRequest = new XMLHttpRequest();
                xmlHttpRequest.onreadystatechange = function(){
                    if(xmlHttpRequest.status == 200 && xmlHttpRequest.readyState == 4){
                        let i = '{ "status":false,"message":"连接服务失败","tologin":false}';
                        if(xmlHttpRequest.responseText != i){
                            allInfo.push(xmlHttpRequest.responseText);
                        }
                        eachUrl();
                    }
                }
                var formdata = new FormData();
                formdata.append("username","xxxxx");
                formdata.append("password","xxxx");
                xmlHttpRequest.open("POST",url,true);
                //xmlHttpRequest.timeout = 5000;
                xmlHttpRequest.send(formdata);
            }else{
                getMsg();
            }
        },50);
    }

    //获取联系方式
    function getMsg(){
        var contact = [];
        if(allInfo.length > 0){
            var info = allInfo.pop();
            var input = jQuery(info).find("input[id='companyname']");
            var textarea = jQuery(info).find("div[id = 'GetCompanyContact'] textarea");
            var name = input.attr("value");
            contact.push(name);
            if(textarea){
                let msg = textarea.text();
                contact.push(msg);
            }
            message.push(contact);
            getMsg();
        }else{
            alert(totalPage);
            write(message);
            flag2++;
            totalPage += 2;
            flag1 = 0;
            urlInfo = [];
            message = [];
            if(flag2 < wanted){
                get = setInterval(interval,2000);
            }
        }
    }

    function write(msg1){
        for(let i = 0 ; i < msg1.length ; i++){
            let table = document.createElement('table');
            let tr = document.createElement('tr');
            let td1 = document.createElement('td');
            let td2 = document.createElement('td');
            td1.innerHTML=msg1[i][0];
            td2.innerHTML=msg1[i][1];
            tr.appendChild(td1);
            tr.appendChild(td2);
            table.appendChild(tr);
            document.body.appendChild(table);
        }
    }
})();
