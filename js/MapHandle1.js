//调用地图显示

var map,layerMap,layerCamera,layerPhotoMap,vectors,menuInfoWin=null,tabsInfoWin=null,flag=false,cam_info={},jb = 3,
    drawLine,lineLayer,drawLayer1,drowLayer,drawCricle,drawPolygon,lineLayer1,drawLine1,markers,a,b,c,bt = false,
    //后台接口
    urlName = 'http://police.xiaofen809.com:8080',
    //地图
    //localhost = 'http://10.161.236.119:8081',
    localhost = 'http://192.168.1.200:8090',
    //地图图层
    //urlMap = `${localhost}/geoesb/proxy/services/maps/rest/1e6e4f5f311f46458bab4229d67fac14/af8551534a4b4b13ab60eac366ba44ef`,
    urlMap = `${localhost}/iserver/services/map-XC_ZW2/rest/maps/XCZW2017DLG1脱密`,
    //摄像头图层
    //urlCamera = `${localhost}/iserver/services/map-POI/rest/maps/poi`,
    //影像地图
    urlPhotoMap = `${localhost}/iserver/services/map-XC_ZW2/rest/maps/XCZW2017DOM`;

let obj = readData('USER_KEY');
const token = obj.token;
const mobile = obj.mobile;
function init() {
    //初始化地图对象。
    map = new SuperMap.Map("map", {
        controls: [
            new SuperMap.Control.MousePosition(),
            new SuperMap.Control.Navigation(),
            new SuperMap.Control.ScaleLine(),
        ],
        //地图所有图层都被当做叠加图层来使用。
        allOverlays: false
    });
    //地图图层
    layerMap = new SuperMap.Layer.TiledDynamicRESTLayer("西城", urlMap, null, {maxResolution:"auto"});
    layerMap.events.on({"layerInitialized": addLayerMap});
    //摄像头图层
    //layerCamera = new SuperMap.Layer.TiledDynamicRESTLayer("摄像头", urlCamera, null, {maxResolution:"auto"});
    //layerCamera.events.on({"layerInitialized": addLayerMap});
    markers = new SuperMap.Layer.Markers("Markers",{});
    //画线
    lineLayer1 = new SuperMap.Layer.Vector("lineLayer1");
    drawLine1 = new SuperMap.Control.DrawFeature(lineLayer1, SuperMap.Handler.Path, { multi: true});
    drawLine1.events.on({"featureadded":drawCompleted2});
    //测距
    lineLayer = new SuperMap.Layer.Vector('lineLayer');
    drawLine = new SuperMap.Control.DrawFeature(lineLayer,SuperMap.Handler.Path,{multi:true});
    /*注册featureadded事件drawCompleted()方法
     * 例如注册“loadstart”事件的单独监听
     * events.on({'loadstart':loadStratListener});*/
    drawLine.events.on({"featureadded":drawCompleted1});
    //圆形
    drawLayer1 = new SuperMap.Layer.Vector("DrawLayer");
    drawCricle = new SuperMap.Control.DrawFeature(drawLayer1,SuperMap.Handler.RegularPolygon,{handlerOptions:{sides:500}} );
    drawCricle.events.on({ "featureadded": drawCricleCompleted });
    //多边形
    drowLayer = new SuperMap.Layer.Vector("DrowLayer");
    drawPolygon = new SuperMap.Control.DrawFeature(drowLayer, SuperMap.Handler.Polygon);
    drawPolygon.events.on({ "featureadded": drawPolygonCompleted });
    map.addControls([drawCricle,drawPolygon,drawLine,drawLine1]);

    //模拟摄像头矢量图层
    //构建 矢量覆盖物 图层。
    vectors=new SuperMap.Layer.Vector("vectors");
    //矢量覆盖物回传事件
    var callbacks = {
        over: onFeatureHovered,
        click: pointClick,
        out: closeTabsInfoWin,
        clickout: closeMenuInfoWin,
        rightclick: onFeatureSelected
    };
    //创建一个矢量选择要素的控件，在指定图层上单击鼠标选择矢量要素。
    var selectFeature = new SuperMap.Control.SelectFeature(vectors,
        {
            callbacks: callbacks,
            hover: false
        });
    map.addControl(selectFeature);
    //激活控件。
    selectFeature.activate();
    //获取摄像头信息
    getCameraInfo();
}
function addLayerMap() {
    //影像地图
    layerPhotoMap = new SuperMap.Layer.TiledDynamicRESTLayer("西城影像", urlPhotoMap, null, {maxResolution:"auto"},{cacheEnabled: false});
    layerPhotoMap.events.on({"layerInitialized": addLayerPhotoMap});
}
function addLayerPhotoMap() {
    layerMap.isBaseLayer=true;
    layerPhotoMap.isBaseLayer=true;
    //将 底图 和 两类覆盖物图层 添加到地图上。
    map.addLayers([layerMap,layerPhotoMap,lineLayer,lineLayer1,drowLayer,drawLayer1,vectors]);
    //设置中心点，指定放缩级别。
    map.setCenter(new SuperMap.LonLat(500377.96 , 305971.1), jb);
}
function changeMap() {
    if (bt == false) {
        layerMap.setVisibility(false);
        layerPhotoMap.setVisibility(true);
        map.setBaseLayer(layerPhotoMap);
        bt = true;
    } else if (bt == true) {
        layerMap.setVisibility(true);
        layerPhotoMap.setVisibility(false);
        map.setBaseLayer(layerMap);
        bt= false;
    }
}
//切换图片
function toggle1(){
    if($('#togPic').attr("src")=="images/map.png")
    {
        $('#togPic').attr("src","images/photoMap.png");
    }
    else
    {
        $('#togPic').attr("src","images/map.png");
    }
}

//标记
var fla = false;
function cli(){
    fla = true;
    $(document.getElementById('SuperMap.Layer.Vector_72_svgRoot')).click(function(){
        if(fla == false){
            return false;
        }
        markers.clearMarkers()
        a = map.controls[0].div.innerText.split(',')
        b = parseInt(a[0])
        c = parseInt(a[1])
        map.addLayer(markers);
        //标记图层上添加标记
        var size = new SuperMap.Size(21,25);
        var offset = new SuperMap.Pixel(-(size.w/2), -size.h);
        var icon = new SuperMap.Icon('images/marker.png',size,offset);
        markers.addMarker(new SuperMap.Marker(new SuperMap.LonLat(b , c),icon));
        fla = false;
    })
}

//归心
function gx(){
    map.setCenter(new SuperMap.LonLat(500377.96 , 305971.1), 4);
}
//测距
    function cj(){
    	distanceMeasure();
    }
    function distanceMeasure(){
        drawLine.activate();
    }
    //绘完触发事件
    function drawCompleted1(drawGeometryArgs){
        //停止画面控制
        drawLine.deactivate();
        //获得图层几何对象
        var geometry = drawGeometryArgs.feature.geometry;
        var measureParam = new SuperMap.REST.MeasureParameters(geometry);
        var myMeasuerService = new SuperMap.REST.MeasureService(url);//量算服务类，该类负责将量算参数传递到服务端，并获取服务器端返回的量算结果
        myMeasuerService.events.on({'processCompleted':measureCompleted});
        //对MeasureService类型进行判娄和赋值，当判娄出是LineString时设置MeasureMode.DISTANCE,否则是MeasureMode.AREA
        myMeasuerService.measureMode = SuperMap.REST.MeasureMode.Distance;
        myMeasuerService.processAsync(measureParam);//processAsync负责将客户端的量算参数传递到服务端。
    }
    //测量结束调用事件
    function measureCompleted(measureEventArgs){
        var distance = String(measureEventArgs.result.distance / 1000);
        var distance1 = Number(distance.substr(0,distance.indexOf('.')+4));
        var unit = measureEventArgs.result.unit;
        alert('量算结果'+distance1+'千米');
    }


//比例尺
function blc(){
    if($(document.getElementById('SuperMap.Control.ScaleLine_7')).css('display') == 'none'){
        $(document.getElementById('SuperMap.Control.ScaleLine_7')).css('display','block');
    }else{
        $(document.getElementById('SuperMap.Control.ScaleLine_7')).css('display','none');
    }
}
//圆形选
function yxx(){
    clearStsatus();
    drawCompleted();
    drawCricle.activate();
}

var s1;
var ss1;
var sss1;
function drawCricleCompleted(eventArgs){
    var args = eventArgs;
    var geometry = args.feature.geometry.getBounds();
    var htmls =0;
    htmls += 1;
    drawCricle.deactivate();
    s1 = eventArgs.feature.geometry.toString();
    localStorage.setItem('s1',s1);
    ss1 = new SuperMap.Geometry.fromWKT(localStorage.getItem('s1'));
    sss1 = new SuperMap.Feature.Vector(ss1);
    drawLayer1.removeAllFeatures();
    drawLayer1.addFeatures(sss1);
}


//多边形选
function dbxx(){
    clearStsatus();
    drawCompleted();
    drawPolygon.activate();
}
var s;
var ss2;
var sss2;
function drawPolygonCompleted(eventArgs) {
    drawPolygon.deactivate();
    s = eventArgs.feature.geometry.toString();
    localStorage.setItem('s',s);
    ss2 = new SuperMap.Geometry.fromWKT(localStorage.getItem('s'));
    sss2 = new SuperMap.Feature.Vector(ss2);
    drowLayer.removeAllFeatures();
    drowLayer.addFeatures(sss2);
}
function clearStsatus(){
    drawLayer1.removeFeatures(sss1);
    drowLayer.removeFeatures(sss2);
}
function drawCompleted(){
    drawCricle.deactivate();
    drawPolygon.deactivate();
}

//清除
function clean(){
    markers.clearMarkers()
    lineLayer.removeAllFeatures();
    drawLayer1.removeFeatures(sss1);
    drowLayer.removeFeatures(sss2);
    lineLayer1.removeAllFeatures();
}

//绘制
function hz(){
    clean()
    drawLine1.deactivate();
    lineLayer1.removeAllFeatures();
    drawLine1.activate();

}
function drawCompleted2(){
    drawLine1.deactivate();
}
//放大
function fd(){
    jb++;
    map.setCenter(new SuperMap.LonLat(500377.96 , 305971.1), jb);
}
//缩小
function sx(){
    jb--;
    map.setCenter(new SuperMap.LonLat(500377.96 , 305971.1), jb);
}

/*---------------------------------调用后台接口---------------------------------------*/
//获取摄像头数据信息
function getCameraInfo(){
    let getData = {
        "mobile": mobile,
        "token": token,
        "page": -1
    };
    $.ajax({
        url: `${urlName}/camera/list`,
        type: 'POST',
        data: getData,
        success: function(data){
            if(data.code==200){
                addMulVector(data.data.rows);
            }else if(data.code === 401){
                console.log(data.data.error);
            }else if(data.code === 501){
                console.log(data.data.error);
            }else if(data.code === 404){
                console.log(data.data.error);
            }else if(data.code === 301){
                console.log(data.data.error);
            }else if(data.code === 500){
                console.log(data.data.error);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
//根据摄像头id返回摄像头信息
function selectCamInfoByID(id){
    let getIdData = {
        "mobile": mobile,
        "token": token,
        "cam_id": id
    };
    $.ajax({
        url: `${urlName}/camera/info`,
        type: 'POST',
        data: getIdData,
        success: function(data){
            if(data.code==200){
                cam_info=data.data.rows[0];
                (cam_info.cam_sta==0)?cam_info.cam_sta="民用":cam_info.cam_sta="警用";
            }else{
                alert('系统错误1');
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
/*---------------------------------操作弹窗---------------------------------------*/
//打开图片查看
function picture() {
    $('#cameradetailsWin').hide();
    $('#menuInfo').hide();
    $('.picture').show()
}
//采集信息
function manage() {
    $('.message').show();
    $('#menuInfo').hide();
}
//轮播图
$("#pic-content").jcImgScroll({
    arrow : {
        width:45,
        height:400,
        x:60,
        y:0
    },
    width : 330, //设置图片宽度
    height:469, //设置图片高度
    imgtop:22,//每张图片的上下偏移量
    imgleft:-30,//每张图片的左边偏移量
    imgwidth:20,//每张图片的宽度偏移量
    imgheight:24,//每张图片的高度偏移量
    count : 9,
    offsetX : 60,
    NumBtn : true,
    title:false,
    setZoom:.8,
});
//搜索框
$('.search input').focus(function () {
    $('.sear-list').show()
})
    .blur(function () {
        $('.sear-list').hide()
    });

//切换摄像头显示列表
function show1() {
    $('.cam-btn-1').css({
        'background-image' : 'url(images/btn-on.png)'
    });
    $('.cam-content1').show()
    $('.cam-btn-2').css({
        'background-image' : 'url(images/btn-off.png)'
    });
    $('.cam-content2').hide()
    $('.cam-btn-3').css({
        'background-image' : 'url(images/btn-off.png)'
    });
    $('.cam-content3').hide()

}
function show2() {
    $('.cam-btn-2').css({
        'background-image' : 'url(images/btn-on.png)'
    });
    $('.cam-content2').show()
    $('.cam-btn-1').css({
        'background-image' : 'url(images/btn-off.png)'
    });
    $('.cam-content1').hide()
    $('.cam-btn-3').css({
        'background-image' : 'url(images/btn-off.png)'
    });
    $('.cam-content3').hide()
}
function show3() {
    $('.cam-btn-3').css({
        'background-image' : 'url(images/btn-on.png)'
    });
    $('.cam-content3').show()
    $('.cam-btn-1').css({
        'background-image' : 'url(images/btn-off.png)'
    });
    $('.cam-content1').hide()
    $('.cam-btn-2').css({
        'background-image' : 'url(images/btn-off.png)'
    });
    $('.cam-content2').hide()
}

//关闭摄像头详细信息
$('#cameradetailsWinclose').click(function() {
    $('#cameradetailsWin').css({'display':'none'});
});

/*---------------------------------添加摄像头矢量图层---------------------------------------*/
//添加多个矢量点
function addMulVector(data){
    //点特征数组
    var point_features = [];
    for(var i=0;i < data.length;i++){
        //console.log(data[i].cam_loc_lan+' '+data[i].cam_loc_lon);
        //声明几何图形点
        var point = new SuperMap.Geometry.Point(data[i].cam_loc_lon, data[i].cam_loc_lan);
        //声明矢量特征
        var feature = new SuperMap.Feature.Vector(point);
        //点特征样式
        feature.style = {
            fillColor: "transparent",//内填充
            strokeColor: "transparent",//外边线
            pointRadius: 13,//不同图层半径不同按参数r传递
            graphicZIndex:data[i].cam_id,
            graphicOpacity:0
        };
        //添加点特征到点特征数组
        point_features.push(feature);
    }
    //矢量图层添加一组点特征数组
    vectors.addFeatures(point_features);
}
/*---------------------------------右键菜单弹框---------------------------------------*/
//点击矢量要素覆盖物，调用此函数。
function onFeatureSelected(feature) {

    if(flag==true){
        return false;
    }
    //closeTabsInfoWin();
    flag=true;
    var popup = new SuperMap.Popup(
        "menuInfo",
        new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
        new SuperMap.Size(175,140),
        "<li id='zjs' onclick='picture()'  style='line-height: 10px;color: #333333;font-size: 14px;padding:10px 5px 5px;border-bottom:1px solid #87CEEB;'><p style='display: inline-block; '>图片查看</p></li>" +
        "<li id='videoplay' style='line-height: 10px;color: #333333;font-size: 14px;padding:10px 5px 5px;border-bottom:1px solid #87CEEB;'><p style='display: inline-block; '>视频查看</p></li>" +
        "<li id='detailinfo' style='line-height: 10px;color: #333333;font-size: 14px;padding:10px 5px 5px;border-bottom:1px solid #87CEEB;'><p style='display: inline-block; '>详细信息</p></li>" +
        "<li id='scs' onclick='manage()' style='line-height: 10px;color: #333333;font-size: 14px;padding:10px 5px 5px;'><p style='display: inline-block; '>任务下发</p></li>",
        null,
        true);
    tabsInfoWin= popup ;
    //添加弹窗到map图层
    map.addPopup(popup);
    //修改菜单样式注意必须等popup实例化后
    $('#menuInfo').css({
        'left':parseInt($('#menuInfo').css('left')) + 16 +"px",
        'top':parseInt($('#menuInfo').css('top')) - 29 +"px",
        'width':'130px',
        'border':'1px solid #87CEEB',
        'box-shadow':'2px 2px 12px rgba(223,234,249,.9)',
        'border-radius':'8px',
        'background':'rgba(223,234,249,.9)',
        'cursor':' pointer'
    });
    $('#menuInfo_contentDiv').css({
        'width':'100%',
        'height':'100%'
    });

    //根据摄像头ID后台获取摄像头信息
    selectCamInfoByID(feature.style.graphicZIndex);
    //摄像头详细信息点击事件
    $('#detailinfo').click(function() {
        $('#cameradetailsWin').css({'display':'block'});

        //添加特定摄像头详细信息
        $('#detailscontent').html("<div id='imgslook' style='background: #000;opacity: .8; line-height: 28px; padding: 5px;font-size: 12px;width: 70px;height: 40px;;color: #fff;font-weight:700;text-align: center;float: right;margin-right: 5px;cursor: pointer;' onclick='picture()'>图片查看</div>"+
            "<li>名称:<p id='cameraName' style='display: inline-block;margin:0 0 5px; text-indent:1em'>"+cam_info.cam_name+"</p></li>"+
            "<li>类型:<p id='cameraName' style='display: inline-block;margin:0 0 5px;text-indent:1em'>"+cam_info.cam_sta+"</p></li>"+
            "<li>朝向:<p id='cameraName' style='display: inline-block;margin:0 0 5px;text-indent:1em'>东北方向</p></li>"+
            "<li>高度:<p id='cameraName' style='display: inline-block;margin:0 0 5px;text-indent:1em'>266cm</p></li>"+
            "<li>安装日期:<p id='cameraName' style='display: inline-block;margin:0 0 5px;text-indent:1em'>"+cam_info.addtime+"</p></li>"+
            "<li>最近维护日期:<p id='cameraName' style='display: inline-block;margin:0 0 5px;text-indent:1em'>"+cam_info.uptime+"</p></li>"+
            "<li><p style='display: inline-block;'>地址:</p><p id='cameraName' style='display:inline-block;margin:0 0 0px;width: 85%;text-indent:1em'>"+cam_info.cam_addr+"</p></li>");
    });

    //菜单视频播放点击事件
    $('#videoplay').click(function() {
        $('#video').css({'display':'block'});
        closeTabsInfoWin();
    });
}
$(function () {
    //创建小方块的jquery对象
    var $video = $("#video");
    //创建小方块的鼠标点按下事件
    $video.mousedown(function (event) {
        //获取鼠标按下的时候左侧偏移量和上侧偏移量
        var old_left = event.pageX;//左侧偏移量
        var old_top = event.pageY;//竖直偏移量

        //获取鼠标的位置
        var old_position_left = $(this).position().left;
        var old_position_top = $(this).position().top;

        //鼠标移动
        $(document).mousemove(function (event) {
            var new_left = event.pageX;//新的鼠标左侧偏移量
            var new_top = event.pageY;//新的鼠标竖直方向上的偏移量

            //计算发生改变的偏移量是多少
            var chang_x = new_left - old_left;
            var change_y = new_top - old_top;

            //计算出现在的位置是多少

            var new_position_left = old_position_left + chang_x;
            var new_position_top = old_position_top + change_y;
            //加上边界限制
            if(new_position_top<0){//当上边的偏移量小于0的时候，就是上边的临界点，就让新的位置为0
                new_position_top=0;
            }
            //如果向下的偏移量大于文档对象的高度减去自身的高度，就让它等于这个高度
            if(new_position_top>$(document).height()-$video.height()){
                new_position_top=$(document).height()-$video.height();
            }
            //右限制
            if(new_position_left>$(document).width()-$video.width()){
                new_position_left=$(document).width()-$video.width();
            }
            if(new_position_left<0){//左边的偏移量小于0的时候设置 左边的位置为0
                new_position_left=0;
            }

            $video.css({
                left: new_position_left + 'px',
                top: new_position_top + 'px'
            })
        });
        $video.mouseup(function(){
            $(document).off("mousemove");
        })
    });
})
/*---------------------------------左键视频播放弹框---------------------------------------*/
//关闭视频播放弹窗
$('#btnPause').click(function() {
    $('#video').css({'display':'none'});
});
//视频播放左键事件
function videoPlayClick(){
    $('#video').css({'display':'block'});
    closeTabsInfoWin();
}
//摄像头点选高亮事件
var pointPops=[];
function pointClick(feature){
    if(flag==false){
        //判断0显示1消除
        if(feature.style.graphicOpacity==0){
            pointSha=parseInt(feature.style.graphicZIndex);
            pointShaId="#"+pointSha;
            pointPops[pointSha]= new SuperMap.Popup(
                pointSha,
                new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
                new SuperMap.Size(15,15),
                null,
                null,
                true);
            map.addPopup(pointPops[pointSha]);
            $(pointShaId).css({
                'left':parseInt($(pointShaId).css('left'))  -12+"px",
                'top':parseInt($(pointShaId).css('top')) -12+"px",
                'box-shadow':'2px 2px 12px #AFEEEE',
                'border-radius':'50%',
                'background':'#FFFF00',
                'opacity':'.4',
                'z-index':'329'
            });
            feature.style.graphicOpacity=1;
        }
        else{
            feature.style.graphicOpacity=0;
            pointPops[feature.style.graphicZIndex].hide();
            pointPops[feature.style.graphicZIndex].destroy();
        }
    }
}
//定义关闭Menu点击事件
function closeMenuInfoWin(){
    if(flag){
        flag = false;
        menuInfoWin.hide();
        menuInfoWin.destroy();
        featureShadow.hide();
        featureShadow.destroy();
    }
}
//定义关闭Tabs点击事件
function closeTabsInfoWin(){
    if(flag){
        flag = false;
        vectors.redraw();
        tabsInfoWin.hide();
        tabsInfoWin.destroy();
    }
}
var flag = false
/*---------------------------------鼠标悬停弹出Tabs---------------------------------------*/
//鼠标悬停弹出Tabs popup，调用此函数。
function onFeatureHovered(feature) {
    //根据摄像头ID后台获取摄像头信息
    selectCamInfoByID(feature.style.graphicZIndex);

    console.log(feature);
    var popup = new SuperMap.Popup(
        "tabsInfo",
        new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
        new SuperMap.Size(175,140),
        "<li id='gz' style='line-height: 10px;color: #333333;font-size: 14px;padding:10px 5px 5px;'><p style='display: inline-block; '>类型:"+cam_info.cam_sta+"</p></li>" +
        "<li id='bfs' style='line-height: 10px;color: #333333;font-size: 14px;padding:10px 5px 5px;'><p style='display: inline-block; '>朝向:东北朝向</p></li>" +
        "<li id='zjs' style='line-height: 10px;color: #333333;font-size: 14px;padding:10px 5px 5px;'><p style='display: inline-block; '>高度:2</p></li>" +
        "<li id='scs' style='line-height: 10px;color: #333333;font-size: 14px;padding:10px 5px 5px;'><p style='display: inline-block; '>位置:"+cam_info.cam_addr+"</p></li>",
        null,
        true);
    menuInfoWin= popup;
    //添加弹窗map图层
    map.addPopup(popup);
    $('#tabsInfo').css({
        'left':parseInt($('#tabsInfo').css('left')) + 16 +"px",
        'top':parseInt($('#tabsInfo').css('top')) - 29 +"px",
        'width':'160px',
        'border':'1px solid #87CEEB',
        'box-shadow':'2px 2px 12px rgba(223,234,249,.9)',
        'border-radius':'8px',
        'background':'rgba(223,234,249,.9)',
    });
    $('#tabsInfo_contentDiv').css({
        'width':'100%',
        'height':'100%'
    });
    if(flag==true){
        tabsInfoWin.hide();
    }else{
        var popup1 = new SuperMap.Popup(
            "featureShadow",
            new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
            new SuperMap.Size(15,15),
            null,
            null,
            true);
        featureShadow= popup1;
        map.addPopup(popup1);
        $('#featureShadow').css({
            'left':parseInt($('#tabsInfo').css('left')) - 28 +"px",
            'top':parseInt($('#tabsInfo').css('top')) + 16+"px",
            'box-shadow':'2px 2px 12px #AFEEEE',
            'border-radius':'50%',
            'background':'#FFFF00',
            'opacity':'.4',
            'z-index':'329'
        });
    }

}
//定义菜单点击关闭事件
function closeMenuInfoWin(){
    if(tabsInfoWin){
        tabsInfoWin.hide();
        tabsInfoWin.destroy();
    }
    if(flag==false){
        featureShadow.hide();
        featureShadow.destroy();
    }
}
init();
