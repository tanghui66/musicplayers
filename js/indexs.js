(function () {


// 页面刚加载读取本地存储歌曲列表
    let data=localStorage.getItem('mList') ?
        JSON.parse(localStorage.getItem('mList')) : [];


//搜索列表 标识
    let searchData =[];
//获取元素
    //上一曲
    let prev = document.querySelector(" .prev");
    // 暂停开始
    let starts = document.querySelector(".start");
    //下一曲
    let next = document.querySelector(" .next");
    //播放音乐
    let audio = document.querySelector("audio");
    //歌手歌曲
    let songSinger = document.querySelector(".ctrl-bars-box span");

    //logo图片
    let logoimg = document.querySelector(".logo img");
    //播放列表
    let playlist = document.querySelector(".play-list-box ul");
    //进度时间
    let nowTimeSpan = document.querySelector(" .nowTime");
    //总时长
    let totalTimeSpan = document.querySelector(" .totalTime");
    let ctrlBars = document.querySelector(" .ctrl-bars");
    //显示进度条
    let nowBars = document.querySelector(" .nowBars");
    //进度条的圆心
    let ctrlBtn = document.querySelector(" .ctrl-btn");
    //音乐播放模式
    let mode = document.querySelector(" .mode");
    let infos = document.querySelector(" .info");





    //变量
    let  index=0; //标识当前歌曲信息

    let rotateDeg=0;// 记录专辑旋转角度
    let tre=null;
   let  modeNum=0;// 0顺序播放 1单曲播放 2随机播放

    function loadPlayList(){
        if(data.length){
            let str=' ';//用来累计播放项
            //加载播放列表
            for (let i = 0; i < data.length ; i++) {
                str +='<li>';
                str +='<i>×</i>';
                str +='<span class="left">'+data[i].name+'</span>';
                str +='<span class="right">';
                for (let j = 0; j <data[i].ar.length; j++) {
                    str +=data[i].ar[j].name+'  ';
                    
                }
                str +='</span>';

                str +='</li>';

            };
            playlist.innerHTML=str;
        }
    };
    loadPlayList();

    // 请求服务器
$(' .search').on('keydown',function (e) {
    //回车键代表的是13 每一个键都相应的数字来标识
    if(e.keyCode === 13){
        $.ajax({
            //服务器请求地址
            url:'https://api.imjad.cn/cloudmusic/',
            //参数
            data:{
                type:'search',
                s:this.value
            },
            success:function (data) {
                searchData =data.result.songs;
                console.log(data.result.songs);
                    var str =' ';
                for (var i = 0; i <searchData.length ; i++) {
                    str+='<li>';
                     str+='<span class="left song">'+ searchData[i].name+'</span>';
                     str+='<span class="right singer">';
                    for (let j = 0; j < searchData[i].ar.length; j++) {
                        str+=searchData[i].ar[j].name+'  ';
                    }
                     str+='</span>';
                     str+='</li>';
                }
                $('.searchUl').html(str);
            },
            error:function (err) {
                console.log(err);
            }
        })
    }

});
//点击搜素列表
    $('.searchUl').on('click','li',function () {
        data.push( searchData[$(this).index()]);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        index =data.length-1;
        quantity();
        init();
        play();
    });

//切换播放选择列表
    function checkPlayList() {
        let listLi=document.querySelectorAll(" .play-list-box li");
        for (let i = 0; i <listLi.length; i++) {
            listLi[i].className=  '';

        }
        listLi[index].className='active';
        // listLi[index].className='active';
    }

    //格式化时间
    function formatTime(time) {
        return time > 9  ? time : '0' + time;
        
    };
    //模式提示框
    function info(str) {
        clearInterval(tre);
        infos.innerHTML=str;
        $(infos).fadeIn();
        // infos.style.display='block';
        tre= setInterval(function () {
            // infos.style.display='none';
            $(infos).fadeOut();
        },1000);

    };
//    播放
function play() {

clearInterval(tre);

    audio.play();

    tre=setInterval(function () {
        rotateDeg++;
        logoimg.style.transform='rotate('+rotateDeg+'deg)';
    },30);
    
}


//播放列表选中
$(playlist).on('click','li',function () {
    index=$(this).index();
    init();
    play();
});
//删除
    $(playlist).on('click','i',function (e) {

        data.splice($(this).parent().index(),1);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        quantity();
// 阻止冒泡
        e.stopPropagation();
    });
//加载列表数量
    function quantity() {
      $('.play-list').html(data.length);
    }
    quantity();
    //初始化
    function init(){
        rotateDeg=0;
        checkPlayList();
        $('.mask').css({
            background:'url("'+data[index].al.picUrl+'")',
            backgroundSize: '100%',

        });
        //设置播放那首歌
        audio.src='http://music.163.com/song/media/outer/url?id='+data[index].id+'.mp3';
        let str ='';
        str+='歌名：'+data[index].name + ' --歌手：';
        for (let i = 0; i < data[index].ar.length; i++) {
            str+=data[index].ar[i].name+'  ';
        }
        songSinger.innerHTML=str;
        logoimg.src=data[index].al.picUrl;
    }

    init();

    // 取不重复的随机数
    function getRandomNum(){
        let  randoNum=Math.floor(Math.random()*data.length);//向下取整
        if(randoNum === index ){
            randoNum=getRandomNum();
        }
        return randoNum;
    };
    //暂停和播放
    starts.addEventListener("click",function () {
        //播放
        if (audio.paused){   //paused这个属性返回的是true fales

            play();
        } else {
            audio.pause();
            clearInterval(tre);
        }
//下一曲
next.addEventListener('click',function () {
    index++;

    index=index>data.length-1?0:index;
    init();
    play();
})

        //上一曲
        prev.addEventListener('click',function () {
            index--;
            index=index<0?data.length-1:index;
            init();
            play();

        });


    });
    // 切换播放模式
    mode.addEventListener('click',function () {
        modeNum++;
        modeNum=modeNum>2?0:modeNum;
        console.log(modeNum);
        switch (modeNum) {
            case 0:
                info('顺序播放');
                mode.style.backgroundPositionX='0px';
                mode.style.backgroundPositionY='275px';

                break;
            case 1:
                info('单曲播放');
                mode.style.backgroundPositionX='60px';
                mode.style.backgroundPositionY='275px';
                break;
            case 2:
                info('随机播放');
                mode.style.backgroundPositionX='60px';
                mode.style.backgroundPositionY='370px';
                break;
        }

    });
    //音乐准备完成
    audio.addEventListener('canplay',function () {
        let  totalTime=audio.duration;//音乐总时长
         let totalM = parseInt(totalTime / 60); //分钟数
         let  totalS =parseInt(totalTime % 60); //秒数
        totalTimeSpan.innerHTML= formatTime(totalM) +':'+ formatTime(totalS);
        audio.addEventListener('timeupdate',function () {
            let currentTime = audio.currentTime;//当前时长
           let currentM=  parseInt(currentTime / 60); //分钟数
            let  currentS =parseInt(currentTime % 60);//秒数
            nowTimeSpan.innerHTML=formatTime(currentM) +':'+formatTime(currentS);

            let barWidth=ctrlBars.clientWidth;//当前的宽度
            let position=currentTime/totalTime*barWidth;
            nowBars.style.width=position +'px';
            ctrlBtn.style.left=position-5+'px';
            if(audio.ended){
                switch (modeNum) {
                    //顺序播放
                    case 0:

                           next.click();
                        break;
                    //单曲播放
                    case 1:

                        init();
                        play();
                        break;
                    //随机播放
                    case 2:

                        index=getRandomNum();
                        init();
                        play();
                        break;
                }
            }

        });
        ctrlBars.addEventListener('click',function (e) {
             audio.currentTime=e.offsetX/ctrlBars.clientWidth*audio.duration;

        });
        // ctrlBars.addEventListener('click',function () {
        //     window.onmouseover=function (e) {
        //         audio.currentTime=e.offsetX/ctrlBars.clientWidth*audio.duration;
        //     }
        //
        // })
    });
})();