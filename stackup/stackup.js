/* STACKUP v0.2.0 (alpha)
This is a javascript based component and need to dependence jquery. More infomation see on Github Website.

License
Code and documentation copyright 2017 Shang De You
Code released under the MIT license.
Docs released under the Creative Commons license

Author
Shang De You @ Taiwan
Contact: upstairs0102@gmail.com   */


function stackup(initParam){
    
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
        $(function(){
            $("#stackup-view" + currentViewNo + "-navBar-title").html(title);
        })
    }
    
    //loading圖示
    var showLoading = function(){
        $(function(){
            if(loading.isShowLoading() == false){
                return;
            }
            if($(".stackup-loading").length == 0){
                var loadingHtml = loading.getLoadingHtml();
                if(loadingHtml != ""){
                    $("#stackup-view" + currentViewNo).append(loadingHtml);
                }
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
        })
    }

    //loading完成（移除全部loading圖示）
    var hideLoading = function(){
        $(function(){
            if(loading.isShowLoading() == false){
                return;
            }
            if(loadingTimmer){
                clearTimeout(loadingTimmer);
                loadingTimmer = null;
            }
            $(".stackup-loading").remove();
        })
    }
    
    var showSystemLoading = function(){
        $(function(){
            if(loading.isShowLoading() == false || loading.isShowSystemLoading()==false){
                return;
            }
            if($(".stackup-systemLoading").length == 0){
                var loadingHtml = loading.getSystemLoadingHtml();
                if(loadingHtml != ""){
                    $("#stackup-view" + currentViewNo).append(loadingHtml);
                }
            }
        })
    }
    
    var hideSystemLoading = function(){
        $(function(){
            if(loading.isShowLoading() == false || loading.isShowSystemLoading() == false){
                return;
            }
            $(".stackup-systemLoading").remove();
        })
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
                $("#stackup-tabBar-item" + no + "> img").attr("src",menuItems[no].selectedIconImg);
                $("#stackup-tabBar-item" + no +"> .stackup-tabBar-item-text").attr("style", "color:"+menuParams.selectedTextColor);
            }else{
                $("#stackup-tabBar-item" + no + "> img").attr("src",menuItems[no].iconImg);
                $("#stackup-tabBar-item" + no +"> .stackup-tabBar-item-text").attr("style", "color:"+menuParams.textColor);
            }
        }
    }

    //=============== PUBLIC FUNCTION  ===============
    
    this.initStage = function(initParam){
        $(function(){
            stage.setStageHtml(initParam);
            var html = stage.getStageHtml();
            $("#stackup").html(html);
        })
    }
    
    this.prepare = function(viewName, action, callback){
        if(!viewName || !action || !callback){
            return;
        }
        if(action != "onLoading" && action != "onLoaded" && action != "onAppear"){
            return;
        }
        if(!callbackStorage[viewName]){
            callbackStorage[viewName] = {};
        }
        callbackStorage[viewName][action] = callback;
    }

    this.first = function(toLoadViewName, param){
        $(function(){
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
            $("#stackup-container").empty();
            $("#stackup-container").css("left","0px");
            $("#stackup-container").css("width",$(window).width());

            var viewHtml = view.getViewHtml(currentViewNo, currentViewName);
            $("#stackup-container").append(viewHtml);

            $(".stackup-view-content").hide();

            if(callbackStorage[currentViewName] != null){
                if(callbackStorage[currentViewName]["onLoading"] != null){
                    callbackStorage[currentViewName]["onLoading"](injection);
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
            $("#stackup-view0-content").load(loadHtmlUrl, function () { 
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
                $("#stackup-view0-content").fadeIn(function(){
                    //showed
                    setTabBarBtnCurrentSelected(currentViewName);
                    
                    if(callbackStorage[currentViewName] != null){
                        if(callbackStorage[currentViewName]["onAppear"] != null){
                            callbackStorage[currentViewName]["onAppear"](injection);
                        }
                    }
                });


            });
        })
    }

    this.push = function(toLoadViewName,param){
        $(function(){
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

            $("#stackup-container").css("width", viewNameStack.length * $(window).width());

            var viewHtml = view.getViewHtml(currentViewNo, currentViewName);
            $("#stackup-view" + originalViewNo).after(viewHtml);	

            $("#stackup-view" + currentViewNo + "-content").hide();
            
            if(callbackStorage[currentViewName] != null){
                if(callbackStorage[currentViewName]["onLoading"] != null){
                    callbackStorage[currentViewName]["onLoading"](injection);
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
                $("#stackup-view" + currentViewNo + "-content").load(loadHtmlUrl, function () {
                    //loaded
                    isViewLoaded = true;
                    stackableToggle = true;
                    
                    //showing
                    $("#stackup-view" + currentViewNo + "-content").fadeIn(function(){
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
            //var arrivalX = $("#stackup-container").offset().left-$(window).width();
            var arrivalX = -currentViewNo*$(window).width();
            $("#stackup-container").stop(true, false).animate({ "left": arrivalX }, 500, function () {

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
        })    
    }

    this.pop = function(param){
        $(function(){
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

            $("#stackup-view" + currentViewNo+ "-content").fadeOut();
            
            currentViewNo -= 1;
            currentViewName = viewNameStack[currentViewNo];
            viewNameStack.pop();

            //moving
            //var arrivalX = $("#stackup-container").offset().left+$(window).width();
            var arrivalX = -currentViewNo*$(window).width();
            $("#stackup-container").stop(true,false).animate({"left":arrivalX},500,function(){

                //moved
                $("#stackup-view" + (currentViewNo + 1)).remove();
                
                $("#stackup-container").css("width", viewNameStack.length * $(window).width());

                //showing
                $("#stackup-view" + currentViewNo + "-content").fadeIn(function(){
                    //showed
                    if(callbackStorage[currentViewName] != null){
                        if(callbackStorage[currentViewName]["onAppear"] != null){
                            callbackStorage[currentViewName]["onAppear"](injection);
                        }
                    }
                });
                
                setTabBarBtnCurrentSelected(currentViewName);
                
                isViewMoved = true;
                stackableToggle = true;
            }); 
        })
        
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
        
        $("#stackup-view" + (currentViewNo)).empty();
        var viewHtml = view.getViewHtml(currentViewNo, currentViewName);
        $("#stackup-view" + (currentViewNo)).append(viewHtml);
        
        var loadHtmlUrl = currentViewName + ".html";

        if(callbackStorage[currentViewName] != null){
            if(callbackStorage[currentViewName]["onLoading"] != null){
                callbackStorage[currentViewName]["onLoading"](injection);
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
        $("#stackup-view" + currentViewNo + "-content").load(loadHtmlUrl, function () {
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
            
            //showing
            $("#stackup-view" + currentViewNo + "-content").fadeIn(function(){
                //showed
                if(callbackStorage[currentViewName] != null){
                    if(callbackStorage[currentViewName]["onAppear"] != null){
                        callbackStorage[currentViewName]["onAppear"](injection);
                    }
                }
            }); 
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
        
        $("#stackup-view" + (currentViewNo)).empty();
        var viewHtml = view.getViewHtml(currentViewNo, currentViewName);
        $("#stackup-view" + (currentViewNo)).append(viewHtml);
        
        var loadHtmlUrl = currentViewName + ".html";
        
        if(loading.isShowSystemLoading() == true){
            showSystemLoading();
        }
        
        //loading
        $("#stackup-view" + currentViewNo + "-content").load(loadHtmlUrl, function () {
            
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
    $(window).resize(function() {
        var viewNo = currentViewNo;
        $('#stackup-container').css("left",-viewNo*$(window).width());
        $('#stackup-container').css("width",(viewNo+1)*$(window).width());
    }).trigger('resize');

    
}
    



