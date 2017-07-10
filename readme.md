STACKUP v0.3.1 (alpha)

STACKUP is a javascript plugin/framework for SPA(Single Page Application), a very easily solution to build a website for MOBILE DEVICE or CROSS-PLATFORM (browsing both on mobile phone and pc). Mainly feature of the framework, main page is ‘STAGE’ and html block is a ‘VIEW’, through stacking actions to ‘PUSH’ or ‘POP’ views on the stage, Implementation a ‘APP APPEARANCE WEBSITE’.


More information and version updates please see on Github Website.


# Startup 

First of all, embed following files below in your html file:

1. stackup.js
2. stickup.css



And before starting, you need to now some rules and suggestions:

1.The view's name must same as html file's name, for example：

*same file path case:*

*view name: ‘home’ -> file name: ‘home.html’*

*different file path case:*

*view name: ‘user/userInfo’ -> file name: ‘user/userInfo.html’*

2.STACKUP component has no limitation about where you coding scripts and how you place the scripts and another files (on this version). As my personal suggestion, you may independent each script as a file for each view, and embed all of them at first before the STACKUP component to be implement. 


# Functions

### 1.Construct STACKUP component
Start to use a STACKUP component

    var stackup = new stackup()



### 2.Initializing a stage
Initializing a stage, and setting up parameters for appearance.

*First, please name a id as “stackup” on a DOM where you will initialize up the stage(will append html of stage). If you’d like the stage as full screen, I suggestion name on <body>, for example:
 `<body id="stackup">`

Then, following script will initialize up the stage

(1)case: without any parameters

    stackup.initStage()

(2)case: with parameters (all the parameters are optional)

    stackup.initStage({
        navBar:{
            title:"DEFAULT TITLE NAME", 
            backBtnImg:"FILE PATH",
            fnBtnImg:"FILE PATH",
            fnBtnPushView:"THE NAME OF VIEW WHICH IS GOING TO PUSH"
        },
        tabBar:{
            textColor:"COLOR NAME OR CODE",
            selectedTextColor:"COLOR NAME OR CODE",
            items:[
                {
                    iconImg:"FILE PATH",
                    selectedIconImg:"FILE PATH",
                    firstView:"THE NAME OF VIEW WHICH IS GOING TO BE FIRST"
                },
                {
                    iconImg:"FILE PATH",
                    selectedIconImg:"FILE PATH",
                    firstView:"THE NAME OF VIEW WHICH IS GOING TO BE FIRST"
                }
            ]
        },
        loading:{
            showWhileViewMoving:true, //default is true
            customHtml:"HTML"
        }
    }) 



### 3.Prepare each view's script
Preparing scripts for each VIEW and each LIFECYCLE

(1)prepare - beforeLoading：Starting to load html file (not completed load yet, so please don’t do any control for html doms cause it’s very highly possibility to be fail!!)

    stackup.prepare(“VIEW NAME”,”beforeLoading",function(view){
        //..your scripts..
    })

(2)prepare - onLoaded：Html file load completed (NOT active this ‘onLoaded’ lifecycle while the case of view has been ‘POP’ and back to the target view. Because the view just back to the stage, not ‘loaded’ again)

    stackup.prepare("VIEW NAME","onLoaded",function(view){
        //..your scripts..
    })

(3)prepare - onAppear：Will active WHENEVER ‘FIRST’/‘PUSH’/‘POP’/‘CHANGE’ the view and appear to stage

    stackup.prepare("VIEW NAME","onAppear",function(view){
        //..your scripts..
    })


usage of the injection ‘VIEW’ :

    view =
    {
        data : {THE PARAMETERS FROM LAST VIEW},
        loading : {
            show : showLoading,  //show the ‘loading’ icon
            hide : hideLoading   //when task has been done, must hide the ‘loading’ icon
        },
        navBar : {
            setTitle : setViewTitle   //set title text for current view
        }
    }

Each ‘VIEW NAME’-‘LIFE CYCLE’ is a SCOPE, every variables in each scope are independent and NOT rendering, it can NOT direct the variable in different scope



### 4.Stacking up!!

(1)’FIRST’ 
set up the first view

    stackup.first(“VIEW NAME”,{TRANSFER PARAMETERS}) 

(2)’PUSH’ 
get a new view and to be the current view on stage, keep and hide the original view

    stackup.push("VIEW NAME",{TRANSFER PARAMETERS})

(3)’POP’
removing the current view and get the last view to be current view, then show on the stage

    stackup.pop({TRANSFER PARAMETERS})

(4)’CHANGE’
just change the current view to be another view, without modify the stack.

    stackup.change(“VIEW NAME”,{TRANSFER PARAMETERS})

(5)’RELOAD’
refresh current view. You should notice that it will not go into ‘beforeLoading’ lifecycle again while reload

    stackup.reload({TRANSFER PARAMETERS})


# License 

License
Code and documentation copyright 2017 Shang De You
Code released under the MIT license.
Docs released under the Creative Commons license

Author
Shang De You @ Taiwan
Contact: upstairs0102@gmail.com  
