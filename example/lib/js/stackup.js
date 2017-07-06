/* STACKUP v0.3.0 (alpha)
This is a javascript plugin/framework for mobile style page and Single Page Application. More infomation see on Github Website.

License
Code and documentation copyright 2017 Shang De You
Code released under the MIT license.
Docs released under the Creative Commons license

Author
Shang De You @ Taiwan
Contact: upstairs0102@gmail.com   */


function stackup(initParam){
    
    var windowWidth = window.innerWidth;
    var stackableToggle = true; //while stacking it'll be false to forbid another stacking task
    var reloadableToggle = true; //after reloading task start it'll be false to forbig another loading task
    var loadingTimmer = null;
    var currentViewNo = 0;
    var currentViewName = "";
    var viewNameStack = [];
    var callbackStorage = {}
    
    //=============== CUSTOM SETTING OBJECTS ===============
    
    //------ tabBar (Tab Bar) ------
    function tabBar(){
        var private_enableTabBar = false;
        var private_tabBarHtml = "";
        var private_tabBarParams = [];
        
        this.getTabBarHtml = function(){
            return private_tabBarHtml;
        }
        this.getTabBarParams = function(){
            return private_tabBarParams;
        }
        this.setTabBarHtml = function(tabBarSetting){
            if(tabBarSetting == null){
                private_enableTabBar = false;
                private_tabBarHtml = "";
                return;
            }
            if(!tabBarSetting["items"]){
                private_enableTabBar = false;
                private_tabBarHtml = "";
                return;
            }
            
            //tabBar params
            private_tabBarParams = tabBarSetting;
            
            //tabBarHtml
            var itemCount = tabBarSetting["items"].length;
            var itemWidthPercent = 100/itemCount;
            var tabBarHtml = "<div id='stackup-tabBar'>";
            for(var itemNo in tabBarSetting["items"]){
                tabBarHtml += "<span id='stackup-tabBar-item" + itemNo + "' onclick='stackup.first(\"" + tabBarSetting["items"][itemNo].firstView + "\")' class='stackup-tabBar-item' style='width:"+itemWidthPercent+"%;'>" +
                                  "<img class='stackup-tabBar-item-img' src='" + tabBarSetting["items"][itemNo].iconImg + "'/>" +
                                  "<span class='stackup-tabBar-item-text'>" + tabBarSetting["items"][itemNo].title + "</span>" +
                              "</span>";
            }
            tabBarHtml += "</div>";

            private_tabBarHtml = tabBarHtml;
            private_enableTabBar = true;
        }
        this.isTabBarEnabled = function(){
            return private_enableTabBar;
        }
    }
    
    //------ navBar (Navigation Bar) ------
    function navBar(){
        //-- View Title
        var private_defaultTitle = "";
        
        var getViewTitleHtml = function(viewNo,title){
            if(!viewNo){
                viewNo = currentViewNo;
            }
            if(!title){
                title = private_defaultTitle;
            }
            var rtn = "";
            if(getTitleAlign() == "left"){
                rtn = "<span id='stackup-view"+viewNo+"-navBar-title'>" +title+ "</span>";
            }else{
                rtn = "<span id='stackup-view"+viewNo+"-navBar-title'>" +title+ "</span>";
            }

            return rtn;
        }
        var setViewTitleText = function(defaultTitle){
            if(!defaultTitle){
                private_defaultTitle = "";
            }
            private_defaultTitle = defaultTitle;
        }

        //-- View Back Button
        var private_enableBackBtn = false;
        var private_backBtnImgHtml = "";
        var getBackBtnHtml = function(viewNo){
            if(private_enableBackBtn == false){
                return "";
            }
            if(!viewNo){
                viewNo = currentViewNo;
            }
            var rtn = "";
            rtn = "<span id='stackup-view" + viewNo + "-navBar-backBtn' onclick='stackup.pop()'>" +
                      private_backBtnImgHtml +
                  "</span>";
            return rtn;
        }
        var setBackBtnHtml = function(imgUrl){
            if(!imgUrl){
                return
            }
            private_enableBackBtn = true;
            private_backBtnImgHtml = "<img src='" + imgUrl + "' onclick='stackup.pop()'/>";
        }

        //-- Function Button
        var private_enableFnBtn = false;
        var private_fnBtnHtml = "";
        var private_fnBtnImgHtml = "";
        var private_fnBtnPushViewName = "";
        var getFnBtnHtml = function(viewNo){
            if(!viewNo){
                viewNo == currentViewNo;
            }
            if(private_enableFnBtn == true){
                var fnBtnHtml = "<span id='stackup-view"+viewNo+"-navBar-fn'>" + 
                                    "<span id='stackup-view"+viewNo+"-navBar-fnBtn0'>" +
                                        private_fnBtnImgHtml +
                                    "</span>" +
                                "</span>";
                return fnBtnHtml;
            }else{
                return "";
            }
        }
        var getFnBtnPushViewName = function(){
            return private_fnBtnPushViewName;
        }
        var setFnBtnHtml = function(imgUrl, pushViewName){
            if(!imgUrl || !pushViewName){
                return
            }
            private_fnBtnPushViewName = pushViewName;
            private_enableFnBtn = true;
            private_fnBtnImgHtml = "<img src='" + imgUrl + "' onclick='stackup.push(\"" + pushViewName + "\")'/>";
        }

        //-- Navigation Bar
        var private_enableNavBar = false;
        var private_navBarHtml = "";
        var private_titleAlign = "left"; //default:left
        this.getNavBarHtml = function(viewNo, viewName){ 
            if(private_enableNavBar == false){
                return "";
            }
            if(!viewNo){
                viewNo = currentViewNo;
            }
            if(!viewName){
                viewName = currentViewName;
            }
            //Back Button
            var backBtnHtml = "";
            if(viewNo == 0){
                backBtnHtml = "<span id='stackup-view0-navBar-backBtn' class='stackup-view-navBar-backBtn--none'></span>";
            }else if(viewNo > 0){
                backBtnHtml = getBackBtnHtml(viewNo);
            }
            //Title
            var viewTitleHtml = getViewTitleHtml(viewNo);
            //Function Button
            var fnBtnHtml = "";
            if(viewName == getFnBtnPushViewName()){ //current view is function view
                fnBtnHtml = "<span id='stackup-view"+viewNo+"-navBar-fn' class='stackup-view-navBar-fn--none'></span>";
            }else{
                fnBtnHtml = getFnBtnHtml(viewNo);
            }
            //Navigation Bar
            var html = "";
            if(private_titleAlign == "center"){
                html = "<div id='stackup-view" + viewNo + "-navBar' class='stackup-view-navBar'>" +
                            backBtnHtml +
                            viewTitleHtml +
                            fnBtnHtml +
                        "</div>";
            }else{ //private_titleAlign == "center"
                html = "<div id='stackup-view" + viewNo + "-navBar' class='stackup-view-navBar'>" +
                           "<span class='stackup-view-navBar-leftSide'>" +
                                backBtnHtml +
                                viewTitleHtml +
                           "</span>" +
                           "<span>" +    
                               fnBtnHtml +
                           "</span>" +
                        "</div>";
            }

            private_navBarHtml = html;
            return private_navBarHtml;
        }
        var getTitleAlign = function(){
            return private_titleAlign;
        }
        this.setNavBarHtml = function(navBarSetting){
            if(!navBarSetting){
                private_enableNavBar = false;
                return;
            }
            if(navBarSetting["title"]){
                //set Title's text
                var title = navBarSetting["title"];
                setViewTitleText(title);
            }
            if(navBarSetting["titleAlign"]){
                //set Title's align
                var align = navBarSetting["titleAlign"];
                if(align == "left" || align == "center"){
                    private_titleAlign = align;
                }
            }
            if(navBarSetting["backBtnImg"]){
                //set Back Button
                var imgUrl = navBarSetting["backBtnImg"];
                setBackBtnHtml(imgUrl);
            }
            if(navBarSetting["fnBtnImg"] && navBarSetting["fnBtnPushView"]){
                //set Function Button
                var imgUrl = navBarSetting["fnBtnImg"];
                var pushViewName = navBarSetting["fnBtnPushView"];
                setFnBtnHtml(imgUrl,pushViewName);
            }
            private_enableNavBar = true;
        }
        this.isNavBarEnabled = function(){
            return private_enableNavBar;
        }
    
    }
           
    //------ View ------
    function view(){
        this.getViewHtml = function(viewNo, viewName){
            if(!viewNo){
                viewNo = currentViewNo;
            }
            if(!viewName){
                viewName = currentViewName;
            }
            var rtn = "";
            var navBarHtml = "";
            var size = "";
            var isFnView = false;
            if(navBar.isNavBarEnabled() == true){
                navBarHtml = navBar.getNavBarHtml(viewNo, viewName);
                size = "stackup-view-content--below";
            }else{
                navBarHtml = "";
                size = "stackup-view-content--fullSize";
            }
            rtn = "<div id='stackup-view" + viewNo + "' class='stackup-view'>" +
                      navBarHtml + 
                      "<div id='stackup-view" + viewNo + "-content' class='stackup-view-content "+size+"'></div>" +
                  "</div>";
            return rtn;
        }
    }
    
    //------ Container ------
    function container(){
        var private_containerSize = "";
        var private_containerHtml = "";
        this.getContainerHtml = function(){
            return private_containerHtml;
        }
        this.setContainerHtml = function(){
            var containerSize = "";
            if(tabBar.isTabBarEnabled() == true){
                //above the tab bar
                containerSize = "stackup-container--above";
            }else{
                //no navigation bar (full screen)
                containerSize = "stackup-container--fullSize";
            }
            private_containerHtml = "<div id='stackup-container' class='"+containerSize+"'></div>";
        }
    }
    
    
    //------ loading ------
    function loading(){
        var private_showLoading = false;
        var private_showSystemLoading = false;  
        var private_customHtml = "";
        var private_loadingHtml = "";
        var private_overTime = 12000;///time line for loading overtime 
        var private_overTimeTask = function(){}; //function
        this.getLoadingHtml = function(){
            if(private_showLoading == true){
                return private_loadingHtml;
            }else{
                return "";
            }
        }
        this.getSystemLoadingHtml = function(){ //while stacking (first & push)
            var loadingHtml = "<div class='stackup-systemLoading'>" + 
                                  private_customHtml +
                              "</div>";
            return loadingHtml;
        }
        this.isShowLoading = function(){
            return private_showLoading;
        }
        this.isShowSystemLoading = function(){
            return private_showSystemLoading;
        }
        this.getLoadingOverTime = function(){
            return private_overTime;
        }
        this.getLoadingOverTimeTask = function(){
            return private_overTimeTask;
        }
        this.setLoading = function(param){
            if(param){
                if(param["customHtml"]){
                    private_customHtml = param["customHtml"];
                    var loadingHtml = "<div class='stackup-loading'>" + 
                                          private_customHtml +
                                      "</div>";
                    private_loadingHtml = loadingHtml;
                    private_showLoading = true;
                }
                if(param["showWhileViewMoving"] == true){
                    private_showSystemLoading = true;
                }else{
                    private_showSystemLoading = false;
                }
                if(param["overTime"]){
                    private_overTime = param["overTime"];
                }
                if(param["overTimeTask"]){
                    private_overTimeTask = param["overTimeTask"];
                }
            }else{
                private_showLoading = false;
                private_showSystemLoading = false;
                private_loadingHtml = "";
            }
        }
    }
    
    //------ Stage ------
    function stage(){
        this.getStageHtml = function(){
            var stageHtml = container.getContainerHtml() + tabBar.getTabBarHtml();
            return stageHtml;
        }
        this.setStageHtml = function(userSetting){
            if(userSetting){
                //set Navigation Bar
                if(userSetting["navBar"]){
                    navBar.setNavBarHtml(userSetting["navBar"]);
                }
                //set Tab Bar
                if(userSetting["tabBar"]){
                    if(userSetting["tabBar"]["items"]){
                        if(userSetting["tabBar"]["items"][0]){
                            tabBar.setTabBarHtml(userSetting["tabBar"]);
                        }
                    }
                }
                //set Loading
                if(userSetting["loading"]){
                    loading.setLoading(userSetting["loading"]);
                }
            }
            //set Container (essential)
            container.setContainerHtml();
        }
    }
    
    
    //Constructing Setting Objects
    var tabBar = new tabBar();
    var navBar = new navBar();
    var view = new view();
    var container = new container();
    var loading = new loading();
    var stage = new stage();
    
    
    //=============== PRIVATE FUNCTION ===============
    
    var emptyDomById = function(domId){
        var dom = document.getElementById(domId);
        while(dom.firstChild) {
            dom.removeChild(dom.firstChild);
        }
    }
    
    var removeDomById = function(domId){
        var dom = document.getElementById(domId);
        if (dom){
            dom.parentNode.removeChild(dom);
        }
    }
    
    var removeDomByClass = function(domClass){
        var doms = document.getElementsByClassName(domClass);
        if(doms){
            for(var no in doms){
                while(doms[0]){
                    var dom = doms[0];
                    dom.parentNode.removeChild(dom);
                }
            }
        }
    }
    
    var hide = function(domId){
        document.getElementById(domId).style.opacity = 0;
    }
    
    var show = function(domId){
        document.getElementById(domId).style.opacity = 1;
    }
    
    var fadeIn = function(domId, callback){
        var value = 0;
        var dom = document.getElementById(domId);
        var doFadeIn = function(){
            if(value>=1){
                if(callback){
                    callback();
                }
                return;
            }
            value = value+0.05;
            dom.style.opacity = value;
            setTimeout(function(){doFadeIn()},10); 
        }
        doFadeIn();
    }
    
    var fadeOut = function(domId, callback){
        var value = 1;
        var dom = document.getElementById(domId);
        var doFadeOut = function(){
            if(value<=0){
                if(callback){
                    callback();
                }
                return;
            }
            value=value-0.05;
            dom.style.opacity= value;
            setTimeout(function(){doFadeOut()},10); 
        }
        doFadeOut();
    }
    
    var slideX = function(domId, targetX, callback){
        var dom = document.getElementById(domId); 
        var x = dom.offsetLeft; 
        var doSlideLeft = function(){
            x=x-20;
            if(x <= targetX){
                dom.style.left = String(targetX) + "px";
                if(callback){
                    callback();
                }
                return;
            }
            dom.style.left= String(x) + "px";
            setTimeout(function(){doSlideLeft()},10); 
        }
        var doSlideRight = function(){
            x=x+20;
            if(x >= targetX){
                dom.style.left = String(targetX) + "px";
                if(callback){
                    callback();
                }
                return;
            }
            dom.style.left= String(x) + "px";
            setTimeout(function(){doSlideRight()},10); 
        }
        if(x > targetX){
            doSlideLeft();
        }else{
            doSlideRight();
        }
    }
    
    var loadHtml = function(domId, htmlName, callback) {
       var con = document.getElementById(domId);
       var xhr = new XMLHttpRequest();

       xhr.onreadystatechange = function (e) { 
           if (xhr.readyState == 4 && xhr.status == 200) {
               con.innerHTML = xhr.responseText;
               if(callback){
                   callback();
               }
           }
       }

       xhr.open("GET", htmlName, true);
       xhr.setRequestHeader('Content-type', 'text/html');
       xhr.send();
    }
    
    var isContainView = function(viewName){
        for(var no in viewNameList){
            var str = viewNameList[no].split("?");
            var view = str[0];
            if(view == viewName){
                return true;
            }
        }
        return false;
    }
    
    var setViewTitle = function(title){
        var domId = "stackup-view" + currentViewNo + "-navBar-title";
        document.getElementById(domId).innerHTML = title;
    }
    
    //loading圖示
    var showLoading = function(){
        if(loading.isShowLoading() == false){
            return;
        }
        var loadingHtml = loading.getLoadingHtml();
        if(loadingHtml != ""){
            var domId = "stackup-view" + currentViewNo;
            document.getElementById(domId).insertAdjacentHTML('beforeend',loadingHtml);
        }
        //clean timer
        if(loadingTimmer){
            clearTimeout(loadingTimmer);
            loadingTimmer = null;
        }
        var loadingOverTime = loading.getLoadingOverTime();
        if(loadingOverTime != 0){ //if enabled
            loadingTimmer = setTimeout(function(){//start timer
                loaded();
                var task = loading.getLoadingOverTimeTask();
                task();//over time task
            },loadingOverTime);   
        }
    }

    //loading完成（移除全部loading圖示）
    var hideLoading = function(){
        if(loading.isShowLoading() == false){
            return;
        }
        if(loadingTimmer){
            clearTimeout(loadingTimmer);
            loadingTimmer = null;
        }
        removeDomByClass("stackup-loading");
    }
    
    var showSystemLoading = function(){
        if(loading.isShowLoading() == false || loading.isShowSystemLoading()==false){
            return;
        }
        var loadingHtml = loading.getSystemLoadingHtml();
        if(loadingHtml != ""){
            var domId = "stackup-view" + currentViewNo;
            document.getElementById(domId).insertAdjacentHTML('beforeend',loadingHtml);
        }
    }
    
    var hideSystemLoading = function(){
        if(loading.isShowLoading() == false || loading.isShowSystemLoading() == false){
            return;
        }
        removeDomByClass("stackup-systemLoading");
    }

    //設定使用者選單按鈕樣式
    var setTabBarBtnCurrentSelected = function(selectedViewName){
        if(!selectedViewName){
            selectedViewName = currentViewName;
        }
        if(tabBar.isTabBarEnabled()==false){
            return;
        }
        if(currentViewNo > 0){
            return;
        }
        var menuParams = tabBar.getTabBarParams();
        var menuItems = menuParams["items"];
        for(var no in menuItems){
            if(menuItems[no].firstView == selectedViewName){
                var doms = document.getElementById("stackup-tabBar-item" + no).getElementsByTagName("img");
                for(var domNo in doms){
                    if(isNaN(domNo)){
                        continue;
                    }
                    var dom = doms[domNo];
                    dom.setAttribute("src",menuItems[no].selectedIconImg);
                }
                var doms = document.getElementById("stackup-tabBar-item" + no).getElementsByClassName("stackup-tabBar-item-text");
                for(var domNo in doms){
                    if(isNaN(domNo)){
                        continue;
                    }
                    var dom = doms[domNo];
                    dom.style.color = menuParams.selectedTextColor;
                }
            }else{
                var doms = document.getElementById("stackup-tabBar-item" + no).getElementsByTagName("img");
                for(var domNo in doms){
                    if(isNaN(domNo)){
                        continue;
                    }
                    var dom = doms[domNo];
                    dom.setAttribute("src",menuItems[no].iconImg);
                }
                var doms = document.getElementById("stackup-tabBar-item" + no).getElementsByClassName("stackup-tabBar-item-text");
                for(var domNo in doms){
                    if(isNaN(domNo)){
                        continue;
                    }
                    var dom = doms[domNo];
                    dom.style.color = menuParams.textColor;
                }
            }
        }
    }

    //=============== PUBLIC FUNCTION  ===============
    
    this.initStage = function(initParam){
        if(document.getElementById('stackup')){
            doInitStage();
        }else{
            //if dom not loaded yet
            document.addEventListener('DOMContentLoaded', function(event){
                doInitStage();
            });  
        }
        function doInitStage(){
            stage.setStageHtml(initParam);
            var html = stage.getStageHtml();
            document.getElementById("stackup").innerHTML = html;
        }
    }
    
    this.prepare = function(viewName, action, callback){
        if(!viewName || !action || !callback){
            return;
        }
        if(action != "beforeLoading" && action != "onLoaded" && action != "onAppear"){
            return;
        }
        if(!callbackStorage[viewName]){
            callbackStorage[viewName] = {};
        }
        callbackStorage[viewName][action] = callback;
    }

    this.first = function(toLoadViewName, param){
        if(document.getElementById('stackup-container')){
            doFirst();
        }else{
            //if dom not loaded yet
            document.addEventListener('DOMContentLoaded', function(event){
                doFirst();
            });  
        }
        function doFirst(){
            if(stackableToggle == false){
                return;
            }
            if(!toLoadViewName){
                toLoadViewName = viewNameStack[0]; //as default
            }
            stackableToggle = false;
            reloadableToggle = true;
            isViewLoaded = false;

            var injection = {
                data: param,
                loading:{
                    show: showLoading,
                    hide: hideLoading
                },
                navBar:{
                    setTitle:setViewTitle
                }
            }

            currentViewNo = 0;
            currentViewName = toLoadViewName;
            viewNameStack = [currentViewName];
            emptyDomById("stackup-container");
            document.getElementById("stackup-container").style.left = "0px";
            document.getElementById("stackup-container").style.width = windowWidth+"px";

            var viewHtml = view.getViewHtml(currentViewNo, currentViewName);

            document.getElementById("stackup-container").insertAdjacentHTML('beforeend',viewHtml);

            hide("stackup-view0-content");

            if(callbackStorage[currentViewName] != null){
                if(callbackStorage[currentViewName]["beforeLoading"] != null){
                    callbackStorage[currentViewName]["beforeLoading"](injection);
                }
            }

            if(loading.isShowSystemLoading() == true){
                showSystemLoading();
            }
            var loadHtmlUrl = currentViewName + ".html";
            if(reloadableToggle == false){ //if it have been reloaded while this task continuing
                if(loading.isShowSystemLoading() == true){
                    hideSystemLoading();
                }
                return;
            }
            //loading
            loadHtml("stackup-view0-content", loadHtmlUrl, function(){
                //loaded
                stackableToggle = true;
                isViewLoaded = true;

                if(callbackStorage[currentViewName] != null){
                    if(callbackStorage[currentViewName]["onLoaded"] != null){
                        callbackStorage[currentViewName]["onLoaded"](injection);
                    }
                }

                if(loading.isShowSystemLoading() == true){
                    hideSystemLoading();
                }

                //showing
                fadeIn("stackup-view0-content", function(){
                    //showed
                    setTabBarBtnCurrentSelected(currentViewName);

                    if(callbackStorage[currentViewName] != null){
                        if(callbackStorage[currentViewName]["onAppear"] != null){
                            callbackStorage[currentViewName]["onAppear"](injection);
                        }
                    }
                });


            });
        }
    }

    this.push = function(toLoadViewName,param){
        if(!toLoadViewName){
            return
        }
        if(stackableToggle == false && reloadableToggle == false){
            return;
        }
        stackableToggle = false;
        reloadableToggle = true;
        isViewLoaded = false;
        isViewMoved = false;

        var injection = {
            data: param,
            loading:{
                show: showLoading,
                hide: hideLoading
            },
            navBar:{
                setTitle:setViewTitle
            }
        }

        var originalViewNo = currentViewNo;
        currentViewNo += 1;
        currentViewName = toLoadViewName;
        viewNameStack.push(toLoadViewName);

        var containerWidthString = String(viewNameStack.length * windowWidth) + "px";
        document.getElementById("stackup-container").style.width = containerWidthString;

        var viewHtml = view.getViewHtml(currentViewNo, currentViewName);
        document.getElementById("stackup-view"+originalViewNo).insertAdjacentHTML('afterend',viewHtml);

        hide("stackup-view" + currentViewNo + "-content");

        if(callbackStorage[currentViewName] != null){
            if(callbackStorage[currentViewName]["beforeLoading"] != null){
                callbackStorage[currentViewName]["beforeLoading"](injection);
            }
        }

        if(loading.isShowSystemLoading() == true){
            showSystemLoading();
        }
        var loadHtmlUrl = currentViewName + ".html";
        if(reloadableToggle == false){ //if it have been reloaded while this task continuing
            if(loading.isShowSystemLoading() == true){
                hideSystemLoading();
            }
            return;
        }else{
            //loading
            loadHtml("stackup-view" + currentViewNo + "-content", loadHtmlUrl, function(){
                //loaded
                isViewLoaded = true;
                stackableToggle = true;

                //showing
                fadeIn("stackup-view" + currentViewNo + "-content", function(){
                    //showed
                });

                if(callbackStorage[currentViewName] != null){
                    if(callbackStorage[currentViewName]["onLoaded"] != null){
                        callbackStorage[currentViewName]["onLoaded"](injection);
                    }
                }

                //loaded & moved (if one of them not completed then continue)
                if (isViewLoaded == true && isViewMoved == true) {
                    if(loading.isShowSystemLoading() == true){
                        hideSystemLoading();
                    }

                    if(reloadableToggle == false){ //if it have been reloaded
                        return;
                    }
                    if(callbackStorage[currentViewName]["onAppear"] != null){
                        callbackStorage[currentViewName]["onAppear"](injection);
                    }

                }
            });
        }

        //moving (moving and loading as same time)
        var arrivalX = -currentViewNo*windowWidth;
        slideX("stackup-container", arrivalX, function(){

            //moved
            isViewMoved = true;

            //loaded & moved (if one of them not completed then continue)
            if (isViewLoaded == true && isViewMoved == true) {
                if(loading.isShowSystemLoading() == true){
                    hideSystemLoading();
                }

                if(reloadableToggle == false){ //if it have been reloaded while this task continuing
                    return;
                }
                if(callbackStorage[currentViewName] != null){
                    if(callbackStorage[currentViewName]["onAppear"] != null){
                        callbackStorage[currentViewName]["onAppear"](injection);
                    }
                }

            } 
        });
    }

    this.pop = function(param){
        if(currentViewNo == 0){
            return;
        }
        if(stackableToggle == false){
            return;
        }
        if(isViewMoved == false){
            return;
        }
        isViewMoved = false;
        stackableToggle = false;
        reloadableToggle = true;

        var injection = {
            data: param,
            loading:{
                show: showLoading,
                hide: hideLoading
            },
            navBar:{
                setTitle:setViewTitle
            }
        }

        fadeOut("stackup-view" + currentViewNo+ "-content");

        currentViewNo -= 1;
        currentViewName = viewNameStack[currentViewNo];
        viewNameStack.pop();

        //moving
        var arrivalX = -currentViewNo*windowWidth;
        slideX("stackup-container", arrivalX, function(){

            //moved
            removeDomById("stackup-view" + (currentViewNo + 1));

            var containerWidthString = String(viewNameStack.length * windowWidth) + "px";
            document.getElementById("stackup-container").style.width = containerWidthString;

            //showed
            if(callbackStorage[currentViewName] != null){
                if(callbackStorage[currentViewName]["onAppear"] != null){
                    callbackStorage[currentViewName]["onAppear"](injection);
                }
            }

            setTabBarBtnCurrentSelected(currentViewName);

            isViewMoved = true;
            stackableToggle = true;
        }); 
    }
    
    this.change = function(toLoadViewName, param){
        if(!toLoadViewName){
            return
        }
        if(stackableToggle == false && reloadableToggle == false){
            return;
        }
        stackableToggle = false;
        isViewLoaded = false;
        
        currentViewName = toLoadViewName;
        
        var injection = {
            data: param,
            loading:{
                show: showLoading,
                hide: hideLoading
            },
            navBar:{
                setTitle:setViewTitle
            }
        }
        
        emptyDomById("stackup-view" + (currentViewNo));
        var viewHtml = view.getViewHtml(currentViewNo, currentViewName);
        document.getElementById("stackup-view" + currentViewNo).insertAdjacentHTML('beforeend',viewHtml);
        
        var loadHtmlUrl = currentViewName + ".html";

        if(callbackStorage[currentViewName] != null){
            if(callbackStorage[currentViewName]["beforeLoading"] != null){
                callbackStorage[currentViewName]["beforeLoading"](injection);
            }
        }
        
        if(loading.isShowSystemLoading() == true){
            showSystemLoading();
        }
        if(reloadableToggle == false){ //if it have been reloaded while this task continuing
            if(loading.isShowSystemLoading() == true){
                hideSystemLoading();
            }
            return;
        }
        //loading
        loadHtml("stackup-view" + currentViewNo + "-content", loadHtmlUrl, function(){
            //loaded
            if(loading.isShowSystemLoading() == true){
                hideSystemLoading();
            }
            
            setTabBarBtnCurrentSelected(currentViewName);
            
            isViewLoaded = true;
            stackableToggle = true;
            
            if(callbackStorage[currentViewName] != null){
                if(callbackStorage[currentViewName]["onLoaded"] != null){
                    callbackStorage[currentViewName]["onLoaded"](injection);
                }
            }
            
            //showed
            if(callbackStorage[currentViewName] != null){
                if(callbackStorage[currentViewName]["onAppear"] != null){
                    callbackStorage[currentViewName]["onAppear"](injection);
                }
            }
        })
        
    }
    
    this.reload = function(param){
        reloadableToggle = false;  //after reloading task start it'll be false to forbig another loading task
        isViewLoaded = false;
        
        var injection = {
            data: param,
            loading:{
                show: showLoading,
                hide: hideLoading
            },
            navBar:{
                setTitle:setViewTitle
            }
        }
        
        emptyDomById("stackup-view" + (currentViewNo));
        var viewHtml = view.getViewHtml(currentViewNo, currentViewName);
        document.getElementById("stackup-view" + currentViewNo).insertAdjacentHTML('beforeend',viewHtml);
        
        var loadHtmlUrl = currentViewName + ".html";
        
        if(loading.isShowSystemLoading() == true){
            showSystemLoading();
        }
        
        //loading
        loadHtml("stackup-view" + currentViewNo + "-content", loadHtmlUrl, function(){
            
            //loaded
            if(loading.isShowSystemLoading() == true){
                hideSystemLoading();
            }
            
            setTabBarBtnCurrentSelected(currentViewName);
            
            isViewLoaded = true;
            stackableToggle = true;
            
            if(callbackStorage[currentViewName] != null){
                if(callbackStorage[currentViewName]["onLoaded"] != null){
                    callbackStorage[currentViewName]["onLoaded"](injection);
                }
            }
            if(callbackStorage[currentViewName] != null){
                if(callbackStorage[currentViewName]["onAppear"] != null){
                    callbackStorage[currentViewName]["onAppear"](injection);
                }
            }
            
        })
    }
    
    //---------------- container width resize ----------------
    window.addEventListener('resize', function(event){
        windowWidth = window.innerWidth;
        var viewNo = currentViewNo;
        var dom = document.getElementById("stackup-container");
        dom.style.left = String(-viewNo*windowWidth) + "px";
        dom.style.width = String((viewNo+1)*windowWidth) + "px";
    });
}
    



