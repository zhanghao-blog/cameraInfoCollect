var map, layer,geolocate,
    url = "http://211.103.178.205:8090/iserver/services/map-XC_ZW/rest/maps/XCZW2017DLG"
    ,loc,lat,positionMarker;
    function init(){
    	//console.log(1);
       map = new SuperMap.Map("map",{controls: [
			new SuperMap.Control.Navigation(),
		],projection: "EPSG:3857"});
		//添加geo定位控件
		geolocate = new SuperMap.Control.Geolocate({
			bind: false,
			geolocationOptions: {
				//enableHighAccuracy: false,
				maximumAge: 0
			},
			eventListeners: {
				"locationupdated": getGeolocationCompleted,
				"locationfailed": getGeolocationFailed
			}
		});
		//激活控件
		map.addControl(geolocate);
		//添加mark
		positionMarker = new SuperMap.Layer.Markers("Markers")
		//加载云图
//      layer = new SuperMap.Layer.CloudLayer();
//      addLayer();
        //加载动态地图
        layer = new SuperMap.Layer.TiledDynamicRESTLayer("China", url,null, {maxResolution:"auto"});
        layer.events.on({"layerInitialized": addLayer});
        
    }
    function addLayer(){
        map.addLayers([layer,positionMarker]);
        if(sessionStorage.getItem('x1')){
        	map.setCenter(new SuperMap.LonLat(sessionStorage.getItem('x1'), sessionStorage.getItem('y1')),4);
        }else if(sessionStorage.getItem('x2')){
        	map.setCenter(new SuperMap.LonLat(sessionStorage.getItem('x2'), sessionStorage.getItem('y2')),4);
        }
        else if(sessionStorage.getItem('x3')){
        	map.setCenter(new SuperMap.LonLat(sessionStorage.getItem('x3'), sessionStorage.getItem('y3')),4);
        }else{
        	map.setCenter(new SuperMap.LonLat(500377.96 , 305971.1),4);
        }
        //map.setCenter(new SuperMap.LonLat(12953017.52769, 4856608.65391), 15);
    }
    init();
    //定位
    function geoLocation(){
    	//alert(2)
		if(!geolocate.active){
			geolocate.activate();
		}
		geolocate.getCurrentLocation();
	}
	//更新定位
	function getGeolocationCompleted(event) {
		//alert(222)
		lon=event.position.coords.longitude;//经度
		lat=event.position.coords.latitude;//纬度
		var x,y;
		x=wgs_xy(lon,lat).x;
		y=wgs_xy(lon,lat).y;
		//测试数据
		x=500377.96;
		y=305971.1;
		//console.log(event.position.coords.longitude+" "+event.position.coords.latitude);
		var lonLat = new SuperMap.LonLat(x, y);
		positionMarker.clearMarkers();
		size = new SuperMap.Size(21, 33),
		offset = new SuperMap.Pixel(-(size.w/2), -size.h),
		icon = new SuperMap.Icon("../img/dw.png", size, offset);
		positionMarker.addMarker(new SuperMap.Marker(lonLat, icon));
		map.setCenter(lonLat);
		var i=sessionStorage.getItem("dt");
	    sessionStorage.setItem('lon'+i,lon);
	    sessionStorage.setItem('lat'+i,lat);
	    sessionStorage.setItem('x'+i,x);
	    sessionStorage.setItem('y'+i,y);
	    
	}
	function getGeolocationFailed(event){
		alert("您当前使用的浏览器不支持地图定位服务");
	}
//	if(sessionStorage.getItem('x1')==''&& sessionStorage.getItem('x2')==''&& sessionStorage.getItem('x3')=='')
//	{
//		alert(3);
		//定位
		//geoLocation();
//	}
	/*-----------------------------------------------坐标转换*---------------------------------*/
	//WGS-84 经纬度->WGS-84 平面 x、y  
    //cameraLon:"cameraLon",//经度  116.36
    //cameraLa:"cameraLat",//纬度        39.9
    //cam_x:227143.5700141657
    //cam_y:4181213.406698619
    //偏差平均 xp -272471.321704289 
    //偏差平均 yp 3878582.4206558596
    function wgs_xy (l, B1)  
    {   
    	console.log(l+" "+B1);
    	var PI=3.14159265358979324;
        l=l*PI/180;
        B1=B1*PI/180;
        var B0 =30*PI/180;
        var N =0, e =0, a =0, b =0, e2 =0, K =0;
        a =6378137;
        b =6356752.3142;
        e = Math.sqrt(1- (b / a) * (b / a));
        e2 = Math.sqrt((a / b) * (a / b) -1);
        var CosB0 = Math.cos(B0);
        N = (a * a / b) / Math.sqrt(1+ e2 * e2 * CosB0 * CosB0);
        K = N * CosB0;
        var SinB =Math.sin(B1);
        var tan =Math.tan(PI/4+ B1/2);
        var E2 = Math.pow((1- e * SinB)/ (1+ e * SinB),e /2);
        var xx = tan*E2;
        return { 'x':K*l-11000000+272471.321704289  , 'y':K*Math.log(xx)-3878582.4206558596}; 
    };
  
//  var point =wgs_xy(116.36,39.9);
//  console.log(point.x+" "+point.y)
    /*------------------------------------------------------------------------------------------*/