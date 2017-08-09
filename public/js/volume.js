'use strict';

var columns = [
    {
        checkbox: true,
        title: 'Check'
    },{
        field: 'Driver',
        title: '드라이버',
        sortable : true,
        halign : "center",
        align : "center"
    }, {
        field: 'Name',
        title: '볼륨 명',
        sortable : true,
        halign : "center",
        align : "center"
    }, {
        field: 'Mountpoint',
        title: '마운트 포인트',
        sortable : true,
        halign : "center",
        align : "center"
    }, {
        field: 'Options',
        title: '옵션'
    }, {
        field: 'Scope',
        title: "스코프"
    }
];


$(function(){


  var $all = {};
  $all.init = function(){};
  $all.form = {};
  $all.form.data = {
    $driver : $("#driverDropdown"),
    $driverMenu : $("#driverMenu"),
    $name : $("#name")
  };
  $all.form.$newForm =  $(".newForm");
  $all.form.formName = "볼륨 생성";
  $all.form.$form = $("#hiddenForm");
  $all.form.formEvent = "CreateVolume";
  $all.form.settingMethod = {
    get : "getVolume",
    set : "setVolume"
  };
  $all.form.getSettingValue = function() {
    var self = this.data ;
    return {
      "Name" : self.$name.val(),
      "Driver" : self.$driver.text().trim()
    }
  };
   $all.form.dropDown =  {
     $dropDown : $('#driverDropDown'),
     default : "driver"
   };
  $all.form.initDropdown = function(){
    var self = this;
    var data = ["local"];
    var $contextMenu =   self.data.$driverMenu;
    var $dropDown =   self.data.$driver;

    return initDropdownArray(data, $contextMenu, $dropDown);
  }
  $all.connect = {};
  $all.connect.dockerinfo = "volume";
  $all.table = {};
  $all.table.main = {
    $table : $(".jsonTable"),
    columns : columns,
    jsonUrl : '/myapp/volume/data.json',
  };
  $all.event = {};
  function clickDefault(client, eventName, table){
    return function(){
      client.sendEventTable(eventName, table);
    };
  }

  $all.event.remove = {
      $button : $(".remove"),
      eventName : "RemoveVolume",
      clickEvent : clickDefault
  };

  $all.completeEvent = function(data, callback){
      if(hasValue(data)){
          var dialog = require("./dialog.js");

           var finished = new dialog("볼륨", data.msg + data.statusCode, $("body"));
           finished.setDefaultButton('Close[Enker]', 'btn-primary create');
           finished.show();

           callback;
         }
  };

    var main = require("./main.js");
    main.init($all);

});
