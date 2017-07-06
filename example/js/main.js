//parameters in json for initializing stage
var stageSetting = {
    navBar:{
        title:"Testing App",
        titleAlign:"left", //left,center (default:left)
        backBtnImg:"img/backBtn.png",
        fnBtnImg:"img/fnBtn.png",
        fnBtnPushView:"views/function"
    },
    tabBar:{
        //bgColor:"#efefef",
        textColor:"#ababab",
        selectedTextColor:"#0088ff",
        items:[
            {
                title:"Home",
                iconImg:"../img/tab1.png",
                selectedIconImg:"../img/tab1_selected.png",
                firstView:"views/home"
            },
            {
                title:"Puppy",
                iconImg:"../img/tab2.png",
                selectedIconImg:"../img/tab2_selected.png",
                firstView:"views/puppy"
            },
            {
                title:"Favorite",
                iconImg:"../img/tab3.png",
                selectedIconImg:"../img/tab3_selected.png",
                firstView:"views/favorite"
            },
            {
                title:"Setting",
                iconImg:"../img/tab4.png",
                selectedIconImg:"../img/tab4_selected.png",
                firstView:"views/setting"
            }
        ]
    },
    loading:{
        showWhileViewMoving:true,
        //iconImg:"",
        customHtml:"<div>" + 
                       "<div><i class='fa fa-spinner fa-pulse fa-3x'></i></div>" +
                       "<div>Loading</div>" +
                   "</div>",
        overTime:12000,
        overTimeTask:function(){
            stackup.first();
        }
    }
};

//---------- Stage 1 ----------
var stackup = new stackup();

//$(function(){ // <-- it's not necessary
    
    //initializing the stage (base on parameters)
    stackup.initStage();

    //stacking the first view
    stackup.first("views/guide1");
//})


//prepare the view's script...
stackup.prepare("views/guide1","onLoaded",function(){
    $("#pushToGuid2").click(function(){
        stackup.push("views/guide2");
    })
})
stackup.prepare("views/guide2","onLoaded",function(){
    $("#popToGuid1").click(function(){
        stackup.pop();
    })
    $("#pushToGuid3").click(function(){
        stackup.push("views/guide3");
    })
})
stackup.prepare("views/guide3","onLoaded",function(){
    $("#popToGuid2").click(function(){
        stackup.pop();
    })
    $("#pushToGuid4").click(function(){
        stackup.push("views/guide4");
    })
})
stackup.prepare("views/guide4","onLoaded",function(){
    $("#popToGuid3").click(function(){
        stackup.pop();
    })
    $("#initNewStage").click(function(){
        stackup.initStage(stageSetting)
        stackup.first("views/home");
    })
})

//---------- Stage 2 ----------

var jsonData = []; // as a public variable

//views/home
stackup.prepare("views/home","beforeLoading",function(view){
    
    view.navBar.setTitle("Home Page");
    
    // get json format data from server api (just a fake demo)
    getData = [
        {
            no:1,
            title:"Coffee",
            class:"fa-coffee"
        },
        {
            no:2,
            title:"Bicycle",
            class:"fa-bicycle"
        },
        {
            no:3,
            title:"Camera",
            class:"fa-camera"
        }
    ]
    jsonData = getData;
    // refresh current view
    stackup.reload(jsonData);
})

stackup.prepare("views/home","onLoaded",function(view){
    if(!view.data){
        return;
    }
    var jsonData = view.data;
    // append values into table
    for(var dataNo in jsonData){
        var rowId = "#home-row"+jsonData[dataNo].no;
        var appendRowHtml = "<tr id='home-row"+jsonData[dataNo].no+"'>" +
                                "<td>" +
                                    "<div class='home-title font2'>"+
                                        jsonData[dataNo].title +
                                    "</div>" +
                                    "<div class='home-date'></div>" +
                                "</td>" +
                            "</tr>";
        $("#home-table").append(appendRowHtml);
        
        // add click actions
        $(rowId).click(dataNo,function(event){
            var param = event.data;
            //push
            stackup.push("views/home-detail",param);
        })
    }
})

//views/home-detail
stackup.prepare("views/home-detail","beforeLoading",function(view){
    
    view.navBar.setTitle("Selected Name");
    
})

stackup.prepare("views/home-detail","onLoaded",function(view){
    if(view.data == null){
        return;
    }
    var no = view.data;
    if(!jsonData[no]){
        return
    }
    var obj = jsonData[no];
    //append text
    if(obj["title"]){
        // renew title name
        var title = obj["title"];
        view.navBar.setTitle(title);
        $("#homeDetail-title").html("This is a " + title);
    }
    if(obj["class"]){
        var className = obj["class"];
        $("#homeDetail-show").html(
            "<i class='fa "+className+"' aria-hidden='true'></i>"
        );
    }
    //button click event
    if(obj["no"] < jsonData.length){
        $("#homeDetail-next").show();
        $("#homeDetail-next").click(function(){
            //get new object number and renew view
            var newNo = parseInt(no) + 1;
            stackup.reload(newNo)
        })
    }
    if(obj["no"] > 1){
        $("#homeDetail-last").show();
        $("#homeDetail-last").click(function(){
            //get new object number and renew view
            var newNo = parseInt(no) - 1;
            stackup.reload(newNo)
        })
    }
})

//views/puppy
stackup.prepare("views/puppy","onLoaded",function(view){
    $("#puppyView-click").click(function(){
        var timmer = setTimeout(function(){//start timer
            view.loading.hide();
        },2000);  
        view.loading.show();
        timmer();
    })
})
